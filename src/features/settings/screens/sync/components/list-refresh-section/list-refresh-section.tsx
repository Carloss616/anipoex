import { Memo, useValue } from "@legendapp/state/react";
import { Frame } from "panelui-web/frame";
import { Select } from "panelui-web/select";
import { Switch } from "panelui-web/switch";
import {
  DESCRIPTIONS,
  LIST_REFRESH_OPTIONS,
} from "@/features/settings/constants";
import { settings$ } from "@/state/settings";

const ITEMS = LIST_REFRESH_OPTIONS.map(({ minutes, label }) => ({
  value: String(minutes),
  label,
}));

/** When opening the app fetches the AniList list again. */
export function ListRefreshSection() {
  const refresh$ = settings$.mangaList.refresh;
  const onOpen = useValue(refresh$.onOpen);

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>AniList list</Frame.Title>
      </Frame.Header>
      <Frame.Panel data-attached="column">
        <Frame.Row
          // biome-ignore lint/a11y/noLabelWithoutControl: the Switch below is its control.
          render={<label />}
        >
          <Frame.Content>
            <Frame.Title as="p">Refresh on open</Frame.Title>
            <Frame.Description>
              {DESCRIPTIONS.listRefreshOnOpen}
            </Frame.Description>
          </Frame.Content>
          <Frame.Actions>
            <Switch
              name="list-refresh-on-open"
              label="Refresh on open"
              checked={onOpen}
              onCheckedChange={(on) => refresh$.onOpen.set(on)}
            />
          </Frame.Actions>
        </Frame.Row>
        {onOpen && (
          <Frame.Row>
            <Frame.Content>
              <Frame.Title as="p">Refresh after</Frame.Title>
              <Frame.Description>
                {DESCRIPTIONS.listRefreshAfter}
              </Frame.Description>
            </Frame.Content>
            <Frame.Actions>
              <Memo>
                {() => (
                  <Select
                    items={ITEMS}
                    value={String(refresh$.minutes.get())}
                    onValueChange={(value) =>
                      value && refresh$.minutes.set(Number(value))
                    }
                  >
                    <Select.Trigger variant="ghost" aria-label="Refresh after">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {ITEMS.map((item) => (
                        <Select.Item key={item.value} value={item.value}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                )}
              </Memo>
            </Frame.Actions>
          </Frame.Row>
        )}
      </Frame.Panel>
    </Frame>
  );
}
