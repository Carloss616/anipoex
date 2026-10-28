import { Shape, Surface } from "@expo/ui/jetpack-compose";
import { padding } from "@expo/ui/jetpack-compose/modifiers";
import { Computed } from "@legendapp/state/react";
import { View } from "react-native";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import type { PageCountProps } from "./page-count";

/** M3's level 2 (3dp), as a floating chip sits over content. */
const ELEVATION = 3;

export function PageCount({ page$, count }: PageCountProps) {
  if (count === 0) return null;

  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 bottom-0 items-center"
    >
      <Host matchContents>
        <Surface
          shape={Shape.Pill({})}
          tonalElevation={ELEVATION}
          shadowElevation={ELEVATION}
          // Outside the pill: room for the shadow, and the lift off the bottom.
          // The tab's content already ends above the system bar (expo-router).
          modifiers={[padding(ELEVATION, ELEVATION, ELEVATION, 24)]}
        >
          <Computed>
            {() => (
              <Text
                style={{ typography: "labelMedium" }}
                modifiers={[padding(12, 6, 12, 6)]}
              >
                {page$.get()} / {count}
              </Text>
            )}
          </Computed>
        </Surface>
      </Host>
    </View>
  );
}
