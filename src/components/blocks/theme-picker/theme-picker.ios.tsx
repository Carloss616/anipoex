import { Button, Circle, HStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  foregroundStyle,
  frame,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Text } from "@/components/native/swift-ui/text";
import { THEME_FAMILIES, theme$ } from "@/state/theme";

/** One glass button per theme family; the picked one is prominent. */
export function ThemePicker() {
  const family = useValue(theme$.family);
  const dark = useValue(theme$.mode) === "dark";

  return (
    <HStack spacing={12}>
      {THEME_FAMILIES.map((entry) => (
        <Button
          key={entry.id}
          onPress={() => theme$.family.set(entry.id)}
          modifiers={[
            buttonStyle(family === entry.id ? "glassProminent" : "glass"),
          ]}
        >
          <HStack spacing={6}>
            <Text>{entry.name}</Text>
            <Circle
              modifiers={[
                frame({ width: 12, height: 12 }),
                foregroundStyle(entry.swatch[dark ? 1 : 0]),
              ]}
            />
          </HStack>
        </Button>
      ))}
    </HStack>
  );
}
