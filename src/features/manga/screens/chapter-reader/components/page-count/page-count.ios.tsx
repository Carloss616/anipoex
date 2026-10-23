import {
  background,
  foregroundStyle,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { Computed } from "@legendapp/state/react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import type { PageCountProps } from "./page-count";

const MATERIAL = { type: "material", material: "bar" } as const;

export function PageCount({ page$, count }: PageCountProps) {
  const insets = useSafeAreaInsets();

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
              textStyle="caption"
              modifiers={[
                foregroundStyle("secondary"),
                padding({ horizontal: 12, vertical: 6 }),
                background(MATERIAL, shapes.capsule()),
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
