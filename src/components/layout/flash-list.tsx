import {
  FlashList as FlashListBase,
  type FlashListProps,
} from "@shopify/flash-list";
import { cn } from "heroui-native/utils";
import { View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useReducedMotion,
} from "react-native-reanimated";
import { withUniwind } from "uniwind";
import { resolveSpacing } from "@/utils/resolveSpacing";

// cast to keep the <T> generic that withUniwind flattens
const FlashListStyled = withUniwind(FlashListBase) as typeof FlashListBase;

export function FlashList<T>({
  style,
  contentContainerClassName,
  ListHeaderComponentStyle,
  ListFooterComponentStyle,
  gap,
  ...props
}: FlashListProps<T> & {
  /**
   * Space between items, on the same scale as Tailwind's `gap-*` classes:
   * `gap={3}` equals `gap-3`. Outer edges stay flush.
   */
  gap?: number;
}) {
  const reducedMotion = useReducedMotion();
  const halfGap = gap ? gap / 2 : 0;

  const getPaddingStyles = (index: number) => {
    if (!halfGap) return {};
    const cols = props.numColumns ?? 1;
    const row = Math.floor(index / cols);
    const lastRow = Math.floor(((props.data?.length ?? 1) - 1) / cols);
    return {
      paddingTop: row === 0 ? 0 : resolveSpacing(halfGap),
      paddingBottom: row === lastRow ? 0 : resolveSpacing(halfGap),
      paddingHorizontal: resolveSpacing(halfGap),
    };
  };

  return (
    <FlashListStyled
      data-gap={gap}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      style={[
        halfGap ? { marginHorizontal: resolveSpacing(-halfGap) } : {},
        style,
      ]}
      contentContainerClassName={cn(
        "px-gutter grow py-gutter",
        contentContainerClassName,
      )}
      ListHeaderComponentStyle={[
        halfGap ? { paddingHorizontal: resolveSpacing(halfGap) } : {},
        ListHeaderComponentStyle,
      ]}
      ListFooterComponentStyle={[
        halfGap ? { paddingHorizontal: resolveSpacing(halfGap) } : {},
        ListFooterComponentStyle,
      ]}
      CellRendererComponent={({ index, style, children, ...props }) => (
        // the cell keeps FlashList's style (it drives `opacity` while
        // recycling); the fade goes on an inner view so both don't fight
        <View style={[getPaddingStyles(index), style]} {...props}>
          <Animated.View
            entering={reducedMotion ? undefined : FadeIn}
            exiting={reducedMotion ? undefined : FadeOut}
          >
            {children}
          </Animated.View>
        </View>
      )}
      {...props}
    />
  );
}
