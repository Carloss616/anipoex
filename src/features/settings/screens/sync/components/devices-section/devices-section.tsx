import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { useSyncDevices } from "../../hooks/use-sync-devices";

export function DevicesSection() {
  const devices = useSyncDevices();
  if (!devices.length) return null;

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>Devices</Frame.Title>
      </Frame.Header>
      <Frame.Panel data-attached="column">
        {devices.map((device) => (
          <Frame.Row key={device.id}>
            <Frame.Media>
              <Icon name={device.icon} size={18} muted />
            </Frame.Media>
            <Frame.Content>
              <Frame.Title as="p">
                {device.title}{" "}
                {device.current && <Badge color="primary">This device</Badge>}
              </Frame.Title>
              {device.detail && (
                <Frame.Description>{device.detail}</Frame.Description>
              )}
            </Frame.Content>
            {device.menu && (
              <Frame.Actions>
                <Menu items={device.menu} align="end">
                  <Button size="icon" variant="ghost" aria-label="More">
                    <Icon name={Icons.more} />
                  </Button>
                </Menu>
              </Frame.Actions>
            )}
          </Frame.Row>
        ))}
      </Frame.Panel>
    </Frame>
  );
}
