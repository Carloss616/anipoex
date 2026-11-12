import { Memo } from "@legendapp/state/react";
import { Frame } from "panelui-web/frame";
import { Select } from "panelui-web/select";
import { DNS_OPTIONS, selectDns } from "@/features/extensions";
import { settings$ } from "@/state/settings";
import { DESCRIPTIONS } from "../../constants";

const DNS_ITEMS = DNS_OPTIONS.map(({ id, name }) => ({
  value: id,
  label: name,
}));

export function NetworkSection() {
  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>Network</Frame.Title>
      </Frame.Header>
      <Frame.Panel data-attached="column">
        <Frame.Row>
          <Frame.Content>
            <Frame.Title as="p">DNS</Frame.Title>
            <Frame.Description>{DESCRIPTIONS.dns}</Frame.Description>
          </Frame.Content>
          <Frame.Actions>
            <Memo>
              {() => (
                <Select
                  items={DNS_ITEMS}
                  value={settings$.device.dns.get() ?? null}
                  onValueChange={(id) => id && selectDns(id)}
                >
                  <Select.Trigger variant="ghost" aria-label="DNS">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {DNS_ITEMS.map((item) => (
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
      </Frame.Panel>
    </Frame>
  );
}
