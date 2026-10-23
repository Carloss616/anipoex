import {
  background,
  clip,
  padding,
  Shapes,
} from "@expo/ui/jetpack-compose/modifiers";
import { Computed } from "@legendapp/state/react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { PageCountProps } from "./page-count";

export function PageCount({ page$, count }: PageCountProps) {
  const insets = useSafeAreaInsets();
  const m3 = useThemeM3Colors();

  if (count === 0) return null;

  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 items-center"
      style={{ bottom: insets.bottom + 24 }}
    >
      <Host matchContents>
        <Computed>
          {() => (
            <Text
              style={{ typography: "labelMedium" }}
              color={m3.onSurfaceVariant}
              modifiers={[
                clip(Shapes.Circle),
                background(m3.surfaceContainer),
                padding(12, 6, 12, 6),
              ]}
            >
              {page$.get()} / {count}
            </Text>
          )}
        </Computed>
      </Host>
    </View>
  );
}
