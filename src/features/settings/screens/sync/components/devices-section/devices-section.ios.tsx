import { HStack, Section, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle, frame } from "@expo/ui/swift-ui/modifiers";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { useRowBackground } from "@/features/settings/hooks/use-row-background";
import { useSyncDevices } from "../../hooks/use-sync-devices";

export function DevicesSection() {
  const devices = useSyncDevices();
  const rowBackground = useRowBackground();
  if (!devices.length) return null;

  return (
    <Section modifiers={[rowBackground]} title="Devices">
      {devices.map((device) => {
        const item = (
          <HStack key={device.id} spacing={12} modifiers={ROW_FILL}>
            <Icon
              name={device.icon}
              size={20}
              muted
              modifiers={[frame({ width: 28 })]}
            />
            <VStack alignment="leading" spacing={2}>
              <HStack spacing={6}>
                <Text>{device.title}</Text>
                {device.current ? (
                  <Badge color="primary">This device</Badge>
                ) : null}
              </HStack>
              {device.detail ? (
                <Text
                  textStyle="subheadline"
                  modifiers={[foregroundStyle("secondary")]}
                >
                  {device.detail}
                </Text>
              ) : null}
            </VStack>
          </HStack>
        );
        return device.menu ? (
          <ContextMenu key={device.id} items={device.menu}>
            {item}
          </ContextMenu>
        ) : (
          item
        );
      })}
    </Section>
  );
}
