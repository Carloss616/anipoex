import { Button, HStack, Section, Spacer, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { DESCRIPTIONS } from "../../constants";
import { useRowBackground } from "../../hooks/use-row-background";
import { runningLabel } from "./utils";

export function ActivitySection() {
  const router = useRouter();
  const rowBackground = useRowBackground();

  return (
    <Section modifiers={[rowBackground]}>
      <Button onPress={() => router.push("/settings/activity")}>
        <HStack spacing={8}>
          <VStack alignment="leading">
            <Text modifiers={[foregroundStyle("primary")]}>Activity</Text>
            <Text
              textStyle="subheadline"
              modifiers={[foregroundStyle("secondary")]}
            >
              {DESCRIPTIONS.activity}
            </Text>
          </VStack>
          <Spacer />
          <Memo>
            {() => (
              <Text modifiers={[foregroundStyle("secondary")]}>
                {runningLabel()}
              </Text>
            )}
          </Memo>
          <Icon name={Icons.chevronRight} size={13} muted />
        </HStack>
      </Button>
    </Section>
  );
}
