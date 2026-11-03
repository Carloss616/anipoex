import { useHeaderHeight } from "expo-router/react-navigation";
import { useEffect } from "react";
import { View, type ViewProps } from "react-native";

// One height for every screen with an inset; key it by route if headers differ.
let lastHeight = 0;

/**
 * A View padded by the header's height, so its content starts below the
 * transparent header. On web that height lands a frame late, so the padding
 * starts from the last one seen.
 */
export function HeaderInsetView({ style, ...props }: ViewProps) {
  const measured = useHeaderHeight();
  const headerHeight = measured || lastHeight;

  // Syncs a cache outside React; written in render, the Compiler skips this.
  useEffect(() => {
    if (measured > 0) lastHeight = measured;
  }, [measured]);

  return <View style={[{ paddingTop: headerHeight }, style]} {...props} />;
}
