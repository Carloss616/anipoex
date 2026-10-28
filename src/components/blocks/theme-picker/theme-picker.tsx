import { Memo } from "@legendapp/state/react";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { THEME_FAMILIES, theme$ } from "@/state/theme";

export function ThemePicker() {
  return (
    <ButtonGroup>
      {THEME_FAMILIES.map((entry) => (
        <Memo key={entry.id}>
          {() => (
            <Button
              variant={
                theme$.family.get() === entry.id ? "secondary" : "outline"
              }
              aria-pressed={theme$.family.get() === entry.id}
              onClick={() => theme$.family.set(entry.id)}
            >
              {entry.name}
              <span
                className="size-3 rounded-full"
                style={{
                  backgroundColor:
                    entry.swatch[theme$.mode.get() === "dark" ? 1 : 0],
                }}
              />
            </Button>
          )}
        </Memo>
      ))}
    </ButtonGroup>
  );
}
