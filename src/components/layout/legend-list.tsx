import type { LegendListRenderItemProps } from "@legendapp/list/react-native";
import {
  AnimatedLegendList,
  type AnimatedLegendListProps,
} from "@legendapp/list/reanimated";
import { cn } from "heroui-native/utils";
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

  return (
    <LegendListRoot
      style={[
        halfGap
          ? {
              marginHorizontal: resolveSpacing(-halfGap),
              ...(props.ListHeaderComponent
                ? {}
                : { marginTop: resolveSpacing(-halfGap) }),
            }
          : {},
        // a hidden screen measures 0 wide, so LegendList auto-sizes the list to
        // its widest item. this undoes that — our style wins over its own.
        { width: "auto" },
        style,
      ]}
      contentContainerClassName={cn("grow", contentContainerClassName)}
      ListHeaderComponentStyle={[
        halfGap
          ? {
              paddingHorizontal: resolveSpacing(halfGap),
              marginBottom: resolveSpacing(-halfGap),
            }
          : {},
        ListHeaderComponentStyle,
      ]}
      renderItem={(props) => {
        if (!renderItem) return null;

        return (
          <View
            style={{
              paddingHorizontal: resolveSpacing(halfGap),
              paddingTop: resolveSpacing(halfGap),
            }}
          >
            {renderItem(
              props as LegendListRenderItemProps<T, string | undefined>,
            )}
          </View>
        );
      }}
      ListFooterComponentStyle={[
        halfGap ? { paddingHorizontal: resolveSpacing(halfGap) } : {},
        ListFooterComponentStyle,
      ]}
      itemLayoutAnimation={LinearTransition}
      {...(props as AnimatedLegendListProps<unknown>)}
    />
  );
}
