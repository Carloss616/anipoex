import {
  HStack,
  Label,
  Picker,
  Section,
  Spacer,
  VStack,
} from "@expo/ui/swift-ui";
import {
  foregroundStyle,
  listRowInsets,
  listRowSeparator,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { Computed } from "@legendapp/state/react";
import { PaletteRail } from "@/components/blocks/palette-rail";
import { Text } from "@/components/native/swift-ui/text";
import { sfSymbol } from "@/components/ui/icon";
import { useThemeColor } from "@/hooks/use-theme-color";
import { settings$ } from "@/state/settings";
import { THEME_FAMILIES, type ThemePreference } from "@/state/theme/constants";
import { THEME_OPTIONS } from "../../constants";
import { useRowBackground } from "../../hooks/use-row-background";

export function AppearanceSection() {
  const primary = useThemeColor("primary");
  const rowBackground = useRowBackground();

  return (
    <Section modifiers={[rowBackground]} title="Appearance">
      <Computed>
        {() => (
          // A menu Picker keeps its first tint: rebuild it on a new one.
          <Picker
            key={primary}
            label={<Text>Theme</Text>}
            selection={settings$.theme.preference.get()}
            onSelectionChange={(id: ThemePreference) =>
              settings$.theme.preference.set(id)
            }
          >
            {THEME_OPTIONS.map((option) => (
              <Label
                key={option.id}
                systemImage={sfSymbol(option.icon)}
                modifiers={[tag(option.id)]}
              >
                <Text>{option.label}</Text>
              </Label>
            ))}
          </Picker>
        )}
      </Computed>
      <HStack modifiers={[listRowSeparator("hidden")]}>
        <Text>Palette</Text>
        <Spacer />
        <Computed>
          {() => (
            <Text modifiers={[foregroundStyle(primary)]}>
              {THEME_FAMILIES.find(
                (entry) => entry.id === settings$.theme.family.get(),
              )?.name ?? ""}
            </Text>
          )}
        </Computed>
      </HStack>
      <VStack
        modifiers={[
          listRowInsets({ top: 0, leading: 0, bottom: 0, trailing: 0 }),
        ]}
      >
        <PaletteRail />
      </VStack>
    </Section>
  );
}
