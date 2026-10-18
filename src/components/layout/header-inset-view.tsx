import { useHeaderHeight } from "expo-router/react-navigation";
import { cn } from "panelui-native/utils/cn";
import { View, type ViewProps } from "react-native";

// one height for every screen; key it by route if headers differ.
let lastHeight = 0;

/**
 * A View padded by the header's height, so its content starts below the
 * transparent header. On web that height lands a frame late, so the padding
 * starts from the last one seen and eases into the new one.
 */
export function HeaderInsetView({ className, style, ...props }: ViewProps) {
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
