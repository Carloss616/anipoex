import type {
  LegendListRef,
  LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import {
  LegendList as LegendListBase,
  type LegendListProps as LegendListBaseProps,
} from "@legendapp/list/react-native";
import { useImperativeHandle, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { withUniwind } from "uniwind";
import {
  AnimatedLegendList,
  type AnimatedLegendListProps,
} from "../animated-legend-list";

export type { LegendListRef };

const SLOT_CLASS_NAMES = {
  ListHeaderComponentStyle: {
    fromClassName: "ListHeaderComponentClassName",
  },
  ListFooterComponentStyle: {
    fromClassName: "ListFooterComponentClassName",
  },
} as const;

const LegendListRoot = withUniwind(LegendListBase, SLOT_CLASS_NAMES);
const AnimatedLegendListRoot = withUniwind(
  AnimatedLegendList,
  SLOT_CLASS_NAMES,
) as typeof LegendListRoot;

type UniwindClassNameProps = Omit<
  React.ComponentProps<typeof LegendListRoot>,
  keyof LegendListBaseProps<unknown>
>;

export type LegendListProps<T> = LegendListBaseProps<T> &
  UniwindClassNameProps &
  Pick<AnimatedLegendListProps<T>, "itemLayoutAnimation"> & {
    /**
     * Keeps the list on show while a transparent modal covers its screen.
     * @platform web
     */
    visibleWhenBlurred?: boolean;
  };

export function LegendList<T>({
  style,
  contentContainerStyle,
  ListHeaderComponent,
  ListHeaderComponentStyle,
  ListFooterComponentStyle,
  renderItem,
  // Not forwarded: its gap handling would stack on the padding below
  columnWrapperStyle,
  itemLayoutAnimation,
  visibleWhenBlurred: _,
  ref,
  ...props
}: LegendListProps<T>) {
  // Picked once per call site: switching it would remount the list.
  const Root = itemLayoutAnimation ? AnimatedLegendListRoot : LegendListRoot;
  const gap =
    columnWrapperStyle?.gap ??
    columnWrapperStyle?.rowGap ??
    columnWrapperStyle?.columnGap ??
    0;
  const halfGap = Number(gap) / 2;
  const horizontal = props.horizontal === true;
  const listRef = useRef<LegendListRef>(null);
  useImperativeHandle(ref, () => listRef.current as LegendListRef);

  return (
    // A rail overhangs by half the gap: both ends keep content padding.
    <View
      style={
        horizontal
          ? { margin: -halfGap }
          : {
              flexGrow: 1,
              flexShrink: 1,
              marginTop: ListHeaderComponent ? 0 : -halfGap,
            }
      }
    >
      <Root
        ref={listRef}
        {...(itemLayoutAnimation && { itemLayoutAnimation })}
        style={StyleSheet.flatten([
          // A hidden screen is 0 wide; the list would size to its widest item
          { width: "auto" },
          !horizontal && { flexGrow: 1 },
          style,
        ])}
        contentContainerStyle={StyleSheet.flatten([
          !horizontal && {
            flexGrow: 1,
            marginInline: -halfGap,
            marginBottom: -halfGap,
          },
          contentContainerStyle,
        ])}
        ListHeaderComponent={ListHeaderComponent}
        ListHeaderComponentStyle={StyleSheet.flatten([
          horizontal
            ? { padding: halfGap }
            : {
                paddingInline: halfGap,
                marginBottom: -halfGap,
                zIndex: 1,
              },
          ListHeaderComponentStyle,
        ])}
        renderItem={(props) => {
          if (!renderItem) return null;

          return (
            // Half the gap on each side spaces cells evenly both ways.
            <View style={{ padding: halfGap }}>
              {renderItem(
                props as LegendListRenderItemProps<T, string | undefined>,
              )}
            </View>
          );
        }}
        ListFooterComponentStyle={StyleSheet.flatten([
          // In a rail the footer is one more cell, lined up with the others.
          horizontal ? { padding: halfGap } : { paddingInline: halfGap },
          ListFooterComponentStyle,
        ])}
        {...(props as LegendListBaseProps<unknown>)}
      />
    </View>
  );
}
