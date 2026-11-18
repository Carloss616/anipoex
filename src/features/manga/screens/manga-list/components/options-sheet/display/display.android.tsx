import { Column } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { ButtonGroup } from "@/components/native/jetpack-compose/button-group";
import { Text } from "@/components/native/jetpack-compose/text";
import { columnOptions, columnsFor } from "@/features/manga/utils/list-view";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { settings$ } from "@/state/settings";
import { TITLES } from "../constants";

/** Columns and title position, as two connected button groups. */
export function Display() {
  const { current } = useBreakpoint();
  const m3 = useThemeM3Colors();
  const caption = (text: string) => (
    <Text
      style={{ typography: "bodySmall", fontWeight: "500" }}
      color={m3.onSurfaceVariant}
    >
      {text}
    </Text>
  );
  const columns = columnsFor(current, useValue(settings$.mangaList.density));
  const title = useValue(settings$.mangaList.title);
  const options = columnOptions(current);

  return (
    <Column verticalArrangement={{ spacedBy: 12 }} modifiers={[fillMaxWidth()]}>
      {caption("Columns")}
      <ButtonGroup
        options={options.map((option) => String(option.columns))}
        selected={[options.findIndex((option) => option.columns === columns)]}
        onChange={(index) =>
          settings$.mangaList.density.set(options[index].density)
        }
        modifiers={[fillMaxWidth()]}
      />
      {caption("Title")}
      <ButtonGroup
        options={TITLES.map(([, label]) => label)}
        selected={[TITLES.findIndex(([value]) => value === title)]}
        onChange={(index) => settings$.mangaList.title.set(TITLES[index][0])}
        modifiers={[fillMaxWidth()]}
      />
    </Column>
  );
}
