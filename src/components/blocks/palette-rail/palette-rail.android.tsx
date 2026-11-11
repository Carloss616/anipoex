import { Column, Row } from "@expo/ui/jetpack-compose";
import {
  clickable,
  horizontalScroll,
  padding,
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
      modifiers={[
        selectableGroup(),
        horizontalScroll(),
        padding(16, 0, 16, 16),
      ]}
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
  const select = () => settings$.theme.family.set(id);

  return (
    <Column horizontalAlignment="center" verticalArrangement={{ spacedBy: 7 }}>
      <ScopedTheme theme={theme}>
        <PalettePreview selected={selected} onSelect={select} />
      </ScopedTheme>
      <Name name={name} selected={selected} onSelect={select} />
    </Column>
  );
});

/** Apart from the card: it reads the app's colors, which a pick changes. */
function Name({
  name,
  selected,
  onSelect,
}: {
  name: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const m3 = useThemeM3Colors();

  return (
    <Text
      style={{
        typography: "labelLarge",
        fontWeight: selected ? "600" : undefined,
      }}
      color={selected ? m3.primary : m3.onSurface}
      // No ripple: the card shows the press, the name only widens its target.
      modifiers={selected ? [] : [clickable(onSelect, { indication: false })]}
    >
      {name}
    </Text>
  );
}
