import type { ReactNode } from "react";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useThemeColor } from "@/hooks/use-theme-color";

/** Full width over Home's sections, fading in and out with the draft. */
export function SuggestionsOverlay({
  style,
  children,
}: {
  /**
   * Android starts it under the header, which isn't over the content, on the
   * screen's M3 background.
   */
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  // A style, not `bg-background`: the class didn't paint it on iOS.
  const backgroundColor = useThemeColor("background");

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[StyleSheet.absoluteFill, { backgroundColor }, style]}
    >
      {children}
    </Animated.View>
  );
}
