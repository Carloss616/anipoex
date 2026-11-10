import { Button, HStack, ScrollView, VStack } from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  accessibilityLabel,
  buttonStyle,
  foregroundStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { ScopedTheme } from "uniwind";
import { Text } from "@/components/native/swift-ui/text";
import { settings$ } from "@/state/settings";
import {
  familyTheme,
  THEME_FAMILIES,
  type ThemeFamilyId,
  themeMode$,
} from "@/state/theme";
import { PalettePreview } from "./palette-preview";

/** Every palette as a card painted in it; picking one sets the app's. */
export function PaletteRail() {
  return (
    // shortcut: on a phone the third card already starts partly off-screen; scroll the chosen one into view when there are more families.
    <ScrollView axes="horizontal" showsIndicators={false}>
      <HStack
        spacing={12}
        modifiers={[padding({ horizontal: 20, vertical: 8 })]}
      >
        {THEME_FAMILIES.map((entry) => (
          <PaletteCard key={entry.id} id={entry.id} name={entry.name} />
        ))}
      </HStack>
    </ScrollView>
  );
}

const PaletteCard = memo(function PaletteCard({
  id,
  name,
}: {
  id: ThemeFamilyId;
  name: string;
}) {
  const theme = useValue(() => familyTheme(id, themeMode$.get()));
  const selected = useValue(() => settings$.theme.family.get() === id);

  return (
    <Button
      onPress={() => settings$.theme.family.set(id)}
      modifiers={[
        buttonStyle("plain"),
        accessibilityLabel(name),
        accessibilityAddTraits(selected ? ["isSelected"] : []),
      ]}
    >
      <VStack spacing={7}>
        <ScopedTheme theme={theme}>
          <PalettePreview selected={selected} />
        </ScopedTheme>
        <Text
          textStyle="footnote"
          weight={selected ? "semibold" : undefined}
          modifiers={selected ? [] : [foregroundStyle("secondary")]}
        >
          {name}
        </Text>
      </VStack>
    </Button>
  );
});
