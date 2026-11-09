import {
  Box,
  FilledTonalButton,
  FlowRow,
  OutlinedButton,
  Row,
} from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  Shapes,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { Text } from "@/components/native/jetpack-compose/text";
import { settings$ } from "@/state/settings";
import { THEME_FAMILIES, themeMode$ } from "@/state/theme";

const GAP = { spacedBy: 12 };

/** One button per theme family, wrapping; the picked one is tonal. */
export function ThemePicker() {
  const family = useValue(settings$.theme.family);
  const dark = useValue(themeMode$) === "dark";

  return (
    <FlowRow horizontalArrangement={GAP} verticalArrangement={GAP}>
      {THEME_FAMILIES.map((entry) => {
        const FamilyButton =
          family === entry.id ? FilledTonalButton : OutlinedButton;

        return (
          <FamilyButton
            key={entry.id}
            onClick={() => settings$.theme.family.set(entry.id)}
          >
            <Row
              verticalAlignment="center"
              horizontalArrangement={{ spacedBy: 8 }}
            >
              <Text style={{ typography: "labelLarge" }}>{entry.name}</Text>
              <Box
                modifiers={[
                  size(12, 12),
                  clip(Shapes.Circle),
                  background(entry.swatch[dark ? 1 : 0]),
                ]}
              />
            </Row>
          </FamilyButton>
        );
      })}
    </FlowRow>
  );
}
