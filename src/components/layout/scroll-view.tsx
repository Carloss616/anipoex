import { ScrollView as ScrollViewBase } from "@expo/ui";
import { cn } from "heroui-native/utils";
import {
  ScrollView as RNScrollView,
  type ScrollViewProps,
  View,
} from "react-native";
import { withUniwind } from "uniwind";

export const ScrollView = withUniwind(ScrollViewBase);

// TODO: remove a use @expo/ui ScrollView
export function ScrollViewV0({
  contentContainerClassName,
  ...props
}: ScrollViewProps) {
  return (
    <RNScrollView
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

// TODO: remove a use @expo/ui ScrollView
export function ScrollViewX({
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
      <RNScrollView
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
