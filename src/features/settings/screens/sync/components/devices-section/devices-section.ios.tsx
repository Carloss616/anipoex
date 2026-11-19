import { HStack, Section, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle, frame } from "@expo/ui/swift-ui/modifiers";
import { Text } from "@/components/native/swift-ui/text";
import { Icon } from "@/components/ui/icon";
import { useRowBackground } from "@/features/settings/hooks/use-row-background";
import { useSyncDevices } from "../../hooks/use-sync-devices";

export function DevicesSection() {
  const devices = useSyncDevices();
  const rowBackground = useRowBackground();
  if (!devices.length) return null;

  return (
    <Section modifiers={[rowBackground]} title="Devices">
      {devices.map((device) => (
        <HStack key={device.id} spacing={12}>
          <Icon
            name={device.icon}
            size={20}
            muted
            modifiers={[frame({ width: 28 })]}
          />
          <VStack alignment="leading" spacing={2}>
            <Text>{device.title}</Text>
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
      ))}
    </Section>
  );
}
