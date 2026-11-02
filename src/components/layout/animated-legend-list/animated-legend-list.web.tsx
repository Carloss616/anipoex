import type { LegendListRef } from "@legendapp/list/react-native";
import * as LegendListModule from "@legendapp/list/react-native";
import { LegendList } from "@legendapp/list/react-native";
import {
  createContext,
  type ReactNode,
  type Ref,
  useContext,
  useRef,
} from "react";
import { View, type ViewStyle } from "react-native";
import Reanimated from "react-native-reanimated";
import type { AnimatedLegendListProps } from "./animated-legend-list";
import { useStuck } from "./hooks/use-stuck";

type ItemLayoutAnimation =
  AnimatedLegendListProps<unknown>["itemLayoutAnimation"];

// Untyped in the package; the same helpers its reanimated integration uses.
const { POSITION_OUT_OF_VIEW, peek$, useArr$, useStateContext } = (
  LegendListModule as unknown as {
    internal: {
      POSITION_OUT_OF_VIEW: number;
      peek$: (ctx: unknown, key: string) => unknown;
      useArr$: (keys: string[]) => unknown[];
      useStateContext: () => {
        state: {
          scrollingTo?: unknown;
          positions: number[];
          props: { data: unknown; stickyHeaderIndicesArr: number[] };
        };
      };
    };
  }
).internal;

const ItemLayoutAnimationContext =
  createContext<ItemLayoutAnimation>(undefined);

interface PositionViewProps {
  id: number;
  horizontal?: boolean;
  style: ViewStyle;
  refView: Ref<View>;
  children?: ReactNode;
}

interface StickyPositionViewProps extends PositionViewProps {
  stickyHeaderConfig?: { offset?: number };
}

/**
 * The browser build of LegendList whose cells take a Reanimated layout
 * transition. The package's AnimatedLegendList would also swap the list's
 * scroller for react-native-web's ScrollView, which leaves rows blank on a
 * fast scroll.
 */
export function AnimatedLegendList<T>({
  itemLayoutAnimation,
  ...props
}: AnimatedLegendListProps<T> & { ref?: Ref<LegendListRef> }) {
  return (
    <ItemLayoutAnimationContext value={itemLayoutAnimation}>
      <LegendList
        {...(props as React.ComponentProps<typeof LegendList<T>>)}
        {...{
          positionComponentInternal: PositionView,
          stickyPositionComponentInternal: StickyPositionView,
        }}
      />
    </ItemLayoutAnimationContext>
  );
}

/** The browser build's cell, as a Reanimated view taking the transition. */
function PositionView({
  id,
  horizontal,
  style,
  refView,
  children,
}: PositionViewProps) {
  const ctx = useStateContext();
  const layout = useContext(ItemLayoutAnimationContext);
  const [position = POSITION_OUT_OF_VIEW, isScrollActive] = useArr$([
    `containerPosition${id}`,
    "isScrollActive",
  ]);
  const itemKey = peek$(ctx, `containerItemKey${id}`);
  const lastKey = useRef(itemKey);
  // A recycled cell jumps to its new item's place: only a moved item slides.
  const reused =
    itemKey !== undefined &&
    lastKey.current !== undefined &&
    lastKey.current !== itemKey;
  if (itemKey !== undefined) lastKey.current = itemKey;
  // Only a change of data moves items; a header or row resizing shifts them.
  const data = ctx.state.props.data;
  const lastData = useRef(data);
  const dataChanged = lastData.current !== data;
  lastData.current = data;
  const skip =
    !dataChanged || reused || isScrollActive || ctx.state.scrollingTo;

  return (
    <Reanimated.View
      ref={refView}
      layout={skip ? undefined : layout}
      style={[
        style,
        { contain: "paint layout style" } as ViewStyle,
        horizontal ? { left: position as number } : { top: position as number },
      ]}
    >
      {children}
    </Reanimated.View>
  );
}

/**
 * The package pins a header only at the scroller's edge, then jumps it to
 * `offset`. Here it sits in a track that ends at the next header, so the
 * browser pins it at `offset` and the next one pushes it out.
 */
function StickyPositionView({
  id,
  style,
  refView,
  stickyHeaderConfig,
  children,
}: StickyPositionViewProps) {
  // `positions` mutates in place: the Compiler would keep the first `next`.
  "use no memo";
  const { state } = useStateContext();
  const [position = POSITION_OUT_OF_VIEW, itemIndex] = useArr$([
    `containerPosition${id}`,
    `containerItemIndex${id}`,
    "totalSize",
  ]) as [number | undefined, number];
  const sticky = state.props.stickyHeaderIndicesArr;
  const next = state.positions[sticky[sticky.indexOf(itemIndex) + 1]];
  const track = useStuck();

  return (
    <View
      ref={track}
      pointerEvents="box-none"
      style={[
        style,
        {
          bottom: next === undefined ? 0 : undefined,
          height: next === undefined ? undefined : next - position,
          top: position,
          zIndex: itemIndex + 1000,
        },
      ]}
    >
      <View
        ref={refView}
        style={
          {
            position: "sticky",
            top: stickyHeaderConfig?.offset ?? 0,
          } as unknown as ViewStyle
        }
      >
        {children}
      </View>
    </View>
  );
}
