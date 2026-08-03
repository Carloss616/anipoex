import {
  LegendList as LegendListBase,
  type LegendListProps,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import { cn } from "heroui-native/utils";
import { View } from "react-native";
import { withUniwind } from "uniwind";
import { resolveSpacing } from "@/utils/resolveSpacing";

const LegendListRoot = withUniwind(LegendListBase);

type UniwindClassNameProps = Omit<
  React.ComponentProps<typeof LegendListRoot>,
  keyof LegendListProps
>;

export function LegendList<T>({
  contentContainerClassName,
  style,
  ListHeaderComponentStyle,
  ListFooterComponentStyle,
  renderItem,
  ...props
}: LegendListProps<T> & UniwindClassNameProps) {
  const gap =
    props.columnWrapperStyle?.gap ??
    props.columnWrapperStyle?.rowGap ??
    props.columnWrapperStyle?.columnGap ??
    0;
  const halfGap = gap / 2;

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
    <LegendListRoot
      style={[
        halfGap ? { marginHorizontal: resolveSpacing(-halfGap) } : {},
        style,
      ]}
      contentContainerClassName={cn(
        "grow",
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
      renderItem={(props) => {
        if (!renderItem) return null;
        const paddingStyles = getPaddingStyles(props.index);

        return (
          <View style={paddingStyles}>
            {renderItem(
              props as LegendListRenderItemProps<T, string | undefined>,
            )}
          </View>
        );
      }}
      {...(props as LegendListProps)}
    />
  );
}
