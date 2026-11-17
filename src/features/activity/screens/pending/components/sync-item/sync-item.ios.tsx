import { Button, HStack, Spacer, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import { memo } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { TARGETS } from "./constants";
import { useSyncItem } from "./hooks/use-sync-item";
import type { SyncItemProps } from "./sync-item";

export const SyncItem = memo(function SyncItem({ id }: SyncItemProps) {
  const { line, unsynced } = useSyncItem(id);
  const { title, icon } = TARGETS[id];

  return (
    <Button onPress={() => router.navigate("/settings")}>
      <HStack spacing={12} modifiers={ROW_FILL}>
        <Icon name={icon} size={20} />
        <VStack alignment="leading" spacing={2}>
          <Text modifiers={[foregroundStyle("primary")]}>{title}</Text>
          {line !== "" && (
            <Text
              textStyle="subheadline"
              modifiers={[foregroundStyle("secondary")]}
            >
              {line}
            </Text>
          )}
          {unsynced !== "" && (
            <Text
              textStyle="subheadline"
              modifiers={[foregroundStyle("secondary")]}
            >
              {unsynced}
            </Text>
          )}
        </VStack>
        <Spacer />
        <Icon name={Icons.chevronRight} size={13} muted />
      </HStack>
    </Button>
  );
});
