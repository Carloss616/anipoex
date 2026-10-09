import { useHeaderHeight } from "expo-router/react-navigation";
import { cn } from "panelui-native/utils/cn";
import { View, type ViewProps } from "react-native";

// one height for every screen; key it by route if headers differ.
let lastHeight = 0;

/**
 * Starts below the transparent header. On web its height lands a frame late,
 * so the inset starts from the last one seen and eases into the new one.
 */
export function HeaderInset({ className, style, ...props }: ViewProps) {
  const measured = useHeaderHeight();
  if (measured > 0) lastHeight = measured;
  const headerHeight = measured || lastHeight;

  return (
    <View
      className={cn(
        "transition-[padding-top] duration-300 ease-out",
        className,
      )}
      style={[{ paddingTop: headerHeight }, style]}
      {...props}
    />
  );
}
