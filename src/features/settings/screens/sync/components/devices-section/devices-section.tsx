import { Frame } from "panelui-web/frame";
import { Icon } from "@/components/ui/icon";
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
              <Frame.Title as="p">{device.title}</Frame.Title>
              {device.detail && (
                <Frame.Description>{device.detail}</Frame.Description>
              )}
            </Frame.Content>
          </Frame.Row>
        ))}
      </Frame.Panel>
    </Frame>
  );
}
