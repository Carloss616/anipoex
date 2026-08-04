import type { LegendListRenderItemProps } from "@legendapp/list/react-native";
import {
  AnimatedLegendList,
  type AnimatedLegendListProps,
} from "@legendapp/list/reanimated";
import { cn } from "heroui-native/utils";
import { useMemo } from "react";
import { View } from "react-native";
import { LinearTransition } from "react-native-reanimated";
import { withUniwind } from "uniwind";
import { resolveSpacing } from "@/utils/resolve-spacing";

const LegendListRoot = withUniwind(AnimatedLegendList);

type UniwindClassNameProps = Omit<
  React.ComponentProps<typeof LegendListRoot>,
  keyof AnimatedLegendListProps<unknown>
>;

export function LegendList<T>({
  contentContainerClassName,
  style,
  ListHeaderComponentStyle,
  ListFooterComponentStyle,
  renderItem,
  extraData,
  // consumed here, never forwarded: LegendList's own gap handling is web-only,
  // and letting it through would stack a second gap on top of the padding below
  columnWrapperStyle,
  ...props
}: AnimatedLegendListProps<T> & UniwindClassNameProps) {
  const gap =
    columnWrapperStyle?.gap ??
    columnWrapperStyle?.rowGap ??
    columnWrapperStyle?.columnGap ??
    0;
  const halfGap = gap / 2;

  // cells memoize on `[key, item, extraData]`, so a filtered list keeps stale
  // `index`es — and the padding below reads `index`. fold the length in.
  const itemExtraData = useMemo(
    () => ({ dataLength: props.data?.length, extraData }),
    [props.data?.length, extraData],
  );

  const getPaddingStyles = (index: number) => {
    if (!halfGap) return {};
    return {
      paddingHorizontal: resolveSpacing(halfGap),
      paddingTop: index < (props.numColumns ?? 1) ? 0 : resolveSpacing(gap),
    };
  };

  return (
    <LegendListRoot
      style={[
        halfGap ? { marginHorizontal: resolveSpacing(-halfGap) } : {},
        // a hidden screen measures 0 wide, so LegendList auto-sizes the list to
        // its widest item. this undoes that — our style wins over its own.
        { width: "auto" },
        style,
      ]}
      contentContainerClassName={cn("grow", contentContainerClassName)}
      ListHeaderComponentStyle={[
        halfGap ? { paddingHorizontal: resolveSpacing(halfGap) } : {},
        ListHeaderComponentStyle,
      ]}
      ListFooterComponentStyle={[
        halfGap ? { paddingHorizontal: resolveSpacing(halfGap) } : {},
        ListFooterComponentStyle,
      ]}
      renderItem={(props) => {
        if (!renderItem) return null;

        return (
          <View data-index={props.index} style={getPaddingStyles(props.index)}>
            {renderItem(
              props as LegendListRenderItemProps<T, string | undefined>,
            )}
          </View>
        );
      }}
      extraData={itemExtraData}
      itemLayoutAnimation={LinearTransition}
      {...(props as AnimatedLegendListProps<unknown>)}
    />
  );
}
