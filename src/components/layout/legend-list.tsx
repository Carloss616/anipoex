import type { LegendListRenderItemProps } from "@legendapp/list/react-native";
import {
  AnimatedLegendList,
  type AnimatedLegendListProps,
} from "@legendapp/list/reanimated";
import { cn } from "panelui-native/utils/cn";
import { View } from "react-native";
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
  // never forwarded: its own gap handling is web-only, and would stack on the padding below
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
    // On a wrapper because rn-web puts `style` on both the RefreshControl and the
    // ScrollView it wraps, so a margin on the list itself lands twice
    <View
      style={{
        flexGrow: 1,
        flexShrink: 1,
        marginHorizontal: halfGap ? resolveSpacing(-halfGap) : 0,
        marginTop: gap && !props.ListHeaderComponent ? resolveSpacing(-gap) : 0,
      }}
    >
      <LegendListRoot
        style={[
          // a hidden screen measures 0 wide, and the list would size to its widest item
          { width: "auto" },
          style,
        ]}
        contentContainerClassName={cn("grow", contentContainerClassName)}
        ListHeaderComponentStyle={[
          halfGap ? { paddingHorizontal: resolveSpacing(halfGap) } : {},
          gap ? { marginBottom: resolveSpacing(-gap) } : {},
          ListHeaderComponentStyle,
        ]}
        renderItem={(props) => {
          if (!renderItem) return null;

          return (
            <View
              style={{
                paddingHorizontal: resolveSpacing(halfGap),
                paddingTop: resolveSpacing(gap),
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
        {...(props as AnimatedLegendListProps<unknown>)}
      />
    </View>
  );
}
