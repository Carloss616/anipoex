import { useValue } from "@legendapp/state/react";
import { ChoiceCards } from "panelui-web/choice-cards";
import { memo } from "react";
import { ScrollView, type ViewStyle } from "react-native";
import { ScopedTheme } from "uniwind";
import { settings$ } from "@/state/settings";
import {
  familyTheme,
  THEME_FAMILIES,
  type ThemeFamilyId,
  themeMode$,
} from "@/state/theme";
import { PalettePreview } from "./palette-preview";

const FADE =
  "linear-gradient(to right, transparent, #000 8px, #000 calc(100% - 8px), transparent)";

/** Every palette as a card painted in it; picking one sets the app's. */
export function PaletteRail() {
  const family = useValue(settings$.theme.family);

  return (
    // shortcut: past five families the chosen card can start off-screen; scroll it into view when there are more.
    <ScrollView
      horizontal
      style={
        {
          maskImage: FADE,
          WebkitMaskImage: FADE,
        } as ViewStyle
      }
      className="scrollbar-none hover:scrollbar-auto"
      contentContainerClassName="p-4 pt-1"
    >
      <ChoiceCards
        value={family}
        onValueChange={(id) => settings$.theme.family.set(id as ThemeFamilyId)}
        columns={THEME_FAMILIES.length}
        aspect="3 / 5"
        aria-label="Palette"
        className="w-max gap-3"
      >
        {THEME_FAMILIES.map((entry) => (
          <PaletteCard key={entry.id} id={entry.id} name={entry.name} />
        ))}
      </ChoiceCards>
    </ScrollView>
  );
}

const PaletteCard = memo(function PaletteCard({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const theme = useValue(() => familyTheme(id, themeMode$.get()));

  return (
    <ChoiceCards.Item value={id} className="w-30">
      <ScopedTheme theme={theme}>
        <ChoiceCards.Media className="items-stretch">
          <PalettePreview selected={false} />
        </ChoiceCards.Media>
      </ScopedTheme>
      <ChoiceCards.Label>{name}</ChoiceCards.Label>
    </ChoiceCards.Item>
  );
});
