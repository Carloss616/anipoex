import { HStack, Picker, Section, Spacer, VStack } from "@expo/ui/swift-ui";
import {
  fixedSize,
  foregroundStyle,
  labelsHidden,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { Computed } from "@legendapp/state/react";
import { Text } from "@/components/native/swift-ui/text";
import { DNS_OPTIONS, type DnsId, selectDns } from "@/features/extensions";
import { useThemeColor } from "@/hooks/use-theme-color";
import { settings$ } from "@/state/settings";
import { DESCRIPTIONS } from "../../constants";
import { useRowBackground } from "../../hooks/use-row-background";

export function NetworkSection() {
  const primary = useThemeColor("primary");
  const rowBackground = useRowBackground();

  return (
    <Section modifiers={[rowBackground]} title="Network">
      <HStack>
        <VStack alignment="leading">
          <Text>DNS</Text>
          <Text
            textStyle="subheadline"
            modifiers={[foregroundStyle("secondary")]}
          >
            {DESCRIPTIONS.dns}
          </Text>
        </VStack>
        <Spacer />
        <Computed>
          {() => (
            <Picker
              key={primary}
              label={<Text>DNS</Text>}
              selection={settings$.device.dns.get() ?? null}
              onSelectionChange={(id: DnsId | null) => id && selectDns(id)}
              modifiers={[labelsHidden(), fixedSize()]}
            >
              {DNS_OPTIONS.map((option) => (
                <Text key={option.id} modifiers={[tag(option.id)]}>
                  {option.name}
                </Text>
              ))}
            </Picker>
          )}
        </Computed>
      </HStack>
    </Section>
  );
}
