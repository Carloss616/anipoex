import { Button, HStack, Spacer, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { useDownloadsRow } from "./hooks/use-downloads-row";

export function DownloadsRow() {
  const { label } = useDownloadsRow();

  return (
    <Button onPress={() => router.navigate("/settings/activity")}>
      <HStack spacing={12} modifiers={ROW_FILL}>
        <Icon name={Icons.download} size={20} />
        <VStack alignment="leading" spacing={2}>
          <Text modifiers={[foregroundStyle("primary")]}>{label}</Text>
          <Text
            textStyle="subheadline"
            modifiers={[foregroundStyle("secondary")]}
          >
            Paused until you're back online
          </Text>
        </VStack>
        <Spacer />
        <Icon name={Icons.chevronRight} size={13} muted />
      </HStack>
    </Button>
  );
}
