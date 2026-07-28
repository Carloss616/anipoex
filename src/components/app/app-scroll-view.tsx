import { cn } from "heroui-native/utils";
import { ScrollView, type ScrollViewProps, View } from "react-native";

export function AppScrollView({
  contentContainerClassName,
  ...props
}: ScrollViewProps) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerClassName={cn(
        "px-gutter grow py-gutter",
        contentContainerClassName,
      )}
      {...props}
    />
  );
}

export function AppScrollViewX({
  header,
  footer,
  wrapperClassName,
  className,
  contentContainerClassName,
  ...props
}: Omit<ScrollViewProps, "horizontal"> & {
  wrapperClassName?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <View className={cn("-mx-gutter", wrapperClassName)}>
      {header && <View className="px-gutter">{header}</View>}
      <ScrollView
        horizontal
        contentInsetAdjustmentBehavior="automatic"
        showsHorizontalScrollIndicator={false}
        className={cn("grow-[unset]!", className)}
        contentContainerClassName={cn("px-gutter", contentContainerClassName)}
        {...props}
      />
      {footer && <View className="px-gutter">{footer}</View>}
    </View>
  );
}
