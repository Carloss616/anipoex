import { Memo } from "@legendapp/state/react";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { View } from "react-native";
import { settings$ } from "@/state/settings";
import { THEME_FAMILIES, themeMode$ } from "@/state/theme";

export function ThemePicker() {
  return (
    <ButtonGroup>
      {THEME_FAMILIES.map((entry) => (
        <Memo key={entry.id}>
          {() => (
            <Button
              variant={
                settings$.theme.family.get() === entry.id
                  ? "secondary"
                  : "outline"
              }
              aria-pressed={settings$.theme.family.get() === entry.id}
              onClick={() => settings$.theme.family.set(entry.id)}
            >
              {entry.name}
              <View
                className="size-3 rounded-full"
                style={{
                  backgroundColor:
                    entry.swatch[themeMode$.get() === "dark" ? 1 : 0],
                }}
              />
            </Button>
          )}
        </Memo>
      ))}
    </ButtonGroup>
  );
}
