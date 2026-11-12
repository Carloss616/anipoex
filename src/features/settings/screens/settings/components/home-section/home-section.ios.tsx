import { Button, HStack, Section, Spacer, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { PRESET_LABELS } from "@/features/home/constants";
import { settings$ } from "@/state/settings";
import { DESCRIPTIONS } from "../../constants";
import { useRowBackground } from "../../hooks/use-row-background";

export function HomeSection() {
  const router = useRouter();
  const rowBackground = useRowBackground();

  return (
    <Section modifiers={[rowBackground]} title="Home">
      <Button onPress={() => router.push("/settings/layout")}>
        <HStack spacing={8}>
          <VStack alignment="leading">
            <Text modifiers={[foregroundStyle("primary")]}>Layout</Text>
            <Text
              textStyle="subheadline"
              modifiers={[foregroundStyle("secondary")]}
            >
              {DESCRIPTIONS.layout}
            </Text>
          </VStack>
          <Spacer />
          {/* The preset alone: the count doesn't fit beside it. */}
          <Memo>
            {() => (
              <Text modifiers={[foregroundStyle("secondary")]}>
                {PRESET_LABELS[settings$.home.preset.get()]}
              </Text>
            )}
          </Memo>
          <Icon name={Icons.chevronRight} size={13} muted />
        </HStack>
      </Button>
    </Section>
  );
}
