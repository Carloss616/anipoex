import { Memo } from "@legendapp/state/react";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { Frame } from "panelui-web/frame";
import { PaletteRail } from "@/components/blocks/palette-rail";
import { Icon } from "@/components/ui/icon";
import { settings$ } from "@/state/settings";
import { THEME_OPTIONS } from "../../constants";

export function AppearanceSection() {
  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>Appearance</Frame.Title>
      </Frame.Header>
      <Frame.Panel data-attached="column">
        <Frame.Row className="flex-wrap">
          <Frame.Content className="basis-auto">
            <Frame.Title as="p">Theme</Frame.Title>
          </Frame.Content>
          <Frame.Actions>
            <Memo>
              {() => {
                const preference = settings$.theme.preference.get();

                return (
                  <ButtonGroup aria-label="Theme">
                    {THEME_OPTIONS.map((option) => (
                      <Button
                        key={option.id}
                        size="sm"
                        variant={
                          preference === option.id ? "secondary" : "outline"
                        }
                        aria-pressed={preference === option.id}
                        onClick={() =>
                          settings$.theme.preference.set(option.id)
                        }
                      >
                        <Icon name={option.icon} />
                        {option.label}
                      </Button>
                    ))}
                  </ButtonGroup>
                );
              }}
            </Memo>
          </Frame.Actions>
        </Frame.Row>
        <Frame.Row className="flex-col items-stretch gap-2 px-0 pb-0">
          <Frame.Content className="px-4">
            <Frame.Title as="p">Palette</Frame.Title>
          </Frame.Content>
          <PaletteRail />
        </Frame.Row>
      </Frame.Panel>
    </Frame>
  );
}
