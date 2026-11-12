import { Button, HStack, ScrollView, VStack } from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  accessibilityElement,
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
      <HStack spacing={12} modifiers={[padding({ all: 16 })]}>
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
  const select = () => settings$.theme.family.set(id);

  return (
    <VStack
      spacing={7}
      modifiers={[
        // One VoiceOver element for preview and name; its activation taps the preview.
        accessibilityElement("combine"),
        accessibilityLabel(name),
        accessibilityAddTraits(
          selected ? ["isButton", "isSelected"] : ["isButton"],
        ),
      ]}
    >
      <ScopedTheme theme={theme}>
        <PalettePreview selected={selected} onSelect={select} />
      </ScopedTheme>
      {selected ? (
        <Text textStyle="footnote" weight="semibold">
          {name}
        </Text>
      ) : (
        <Button modifiers={[buttonStyle("plain")]} onPress={select}>
          <Text textStyle="footnote" modifiers={[foregroundStyle("secondary")]}>
            {name}
          </Text>
        </Button>
      )}
    </VStack>
  );
});
