import { useHeaderHeight } from "expo-router/react-navigation";
import { cn } from "panelui-native/utils/cn";
import { useEffect, useState } from "react";
import { View, type ViewProps } from "react-native";

/** Long enough for the late measure to land and finish `duration-300`. */
const SETTLE_MS = 600;

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
  // Only that landing eases; later the measure already follows the header's own animation.
  const [settling, setSettling] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setSettling(false), SETTLE_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      className={cn(
        settling && "transition-[padding-top] duration-300 ease-out",
        className,
      )}
      style={[{ paddingTop: headerHeight }, style]}
      {...props}
    />
  );
}
