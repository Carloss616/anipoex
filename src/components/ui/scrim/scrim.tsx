import { cn } from "panelui-native/utils/cn";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";

export interface ScrimProps {
  children?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Lays its children over a dark wash, so text stays legible on top of artwork.
 *
 * The stops live in `global.css` as the `scrim` utility; the native builds
 * mirror them, so keep the three in sync.
 */
export function Scrim({ children, className, style }: ScrimProps) {
  return (
    <View className={cn("scrim", className)} style={style}>
      {children}
    </View>
  );
}
