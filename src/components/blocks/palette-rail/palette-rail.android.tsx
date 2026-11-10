import { Box, Column, Row } from "@expo/ui/jetpack-compose";
import {
  horizontalScroll,
  padding,
  selectable,
  selectableGroup,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { ScopedTheme } from "uniwind";
import { Text } from "@/components/native/jetpack-compose/text";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
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
    <Row
      horizontalArrangement={{ spacedBy: 12 }}
      modifiers={[selectableGroup(), horizontalScroll(), padding(0, 8, 0, 8)]}
    >
      {THEME_FAMILIES.map((entry) => (
        <PaletteCard key={entry.id} id={entry.id} name={entry.name} />
      ))}
    </Row>
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
  const pick = () => settings$.theme.family.set(id);

  return (
    <Column
      horizontalAlignment="center"
      verticalArrangement={{ spacedBy: 7 }}
      modifiers={[selectable(selected, pick, "radioButton")]}
    >
      <Box modifiers={[padding(0, 7, 7, 0)]}>
        <ScopedTheme theme={theme}>
          <PalettePreview selected={selected} />
        </ScopedTheme>
      </Box>
      <Name name={name} selected={selected} />
    </Column>
  );
});

/** Apart from the card: it reads the app's colors, which a pick changes. */
function Name({ name, selected }: { name: string; selected: boolean }) {
  const m3 = useThemeM3Colors();

  return (
    <Text
      style={{
        typography: "labelLarge",
        fontWeight: selected ? "600" : undefined,
      }}
      color={selected ? m3.primary : m3.onSurface}
    >
      {name}
    </Text>
  );
}
