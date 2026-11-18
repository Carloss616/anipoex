import { useValue } from "@legendapp/state/react";
import { Typography } from "panelui-native/components/typography";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { View } from "react-native";
import { columnOptions, columnsFor } from "@/features/manga/utils/list-view";
import { settings$ } from "@/state/settings";
import { TITLES } from "../constants";

/** Columns and title position, as two segmented rows, like Android's. */
export function Display() {
  const { current } = useBreakpoint();
  const columns = columnsFor(current, useValue(settings$.mangaList.density));
  const title = useValue(settings$.mangaList.title);

  return (
    <View className="gap-3">
      <Typography type="small" muted>
        Columns
      </Typography>
      <ButtonGroup aria-label="Columns" className="w-full">
        {columnOptions(current).map((option) => {
          const selected = option.columns === columns;
          return (
            <Button
              key={option.density}
              size="sm"
              variant={selected ? "secondary" : "outline"}
              aria-pressed={selected}
              onClick={() => settings$.mangaList.density.set(option.density)}
              className="flex-1"
            >
              {option.columns}
            </Button>
          );
        })}
      </ButtonGroup>
      <Typography type="small" muted>
        Title
      </Typography>
      <ButtonGroup aria-label="Title" className="w-full">
        {TITLES.map(([value, label]) => {
          const selected = title === value;
          return (
            <Button
              key={value}
              size="sm"
              variant={selected ? "secondary" : "outline"}
              aria-pressed={selected}
              onClick={() => settings$.mangaList.title.set(value)}
              className="flex-1"
            >
              {label}
            </Button>
          );
        })}
      </ButtonGroup>
    </View>
  );
}
