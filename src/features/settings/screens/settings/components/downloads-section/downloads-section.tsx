import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { Select } from "panelui-web/select";
import { DOWNLOADS_FOOTER, SAVE_TO_OPTIONS } from "./constants";
import { useDownloadsSection } from "./hooks/use-downloads-section";
import type { SaveTo } from "./utils";

const SAVE_TO_ITEMS = SAVE_TO_OPTIONS.map(({ id, label }) => ({
  value: id,
  label,
}));

export function DownloadsSection() {
  const downloads = useDownloadsSection();

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>Downloads</Frame.Title>
      </Frame.Header>
      <Frame.Panel data-attached="column">
        <Frame.Row>
          <Frame.Content>
            <Frame.Title as="p">Save to</Frame.Title>
            {downloads.note && (
              <Frame.Description>{downloads.note}</Frame.Description>
            )}
          </Frame.Content>
          <Frame.Actions>
            <Select
              items={SAVE_TO_ITEMS}
              value={downloads.saveTo}
              onValueChange={(option: SaveTo | null) =>
                option && void downloads.setSaveTo(option)
              }
            >
              <Select.Trigger variant="ghost" aria-label="Save to">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {SAVE_TO_ITEMS.map((item) => (
                  <Select.Item key={item.value} value={item.value}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Frame.Actions>
        </Frame.Row>
        {downloads.folder && (
          <Frame.Row>
            <Frame.Content>
              <Frame.Title as="p">{downloads.folder.name}</Frame.Title>
            </Frame.Content>
            <Frame.Actions>
              <Button
                variant="outline"
                size="sm"
                onClick={downloads.folder.change}
              >
                Change
              </Button>
            </Frame.Actions>
          </Frame.Row>
        )}
      </Frame.Panel>
      <Frame.Footer>
        <Frame.Description>{DOWNLOADS_FOOTER}</Frame.Description>
      </Frame.Footer>
    </Frame>
  );
}
