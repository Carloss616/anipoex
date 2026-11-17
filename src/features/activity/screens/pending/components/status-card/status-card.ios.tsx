import { HStack, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Icon } from "@/components/ui/icon";
import { COPY } from "./constants";
import type { StatusCardProps } from "./status-card";

export function StatusCard({ mode }: StatusCardProps) {
  const { icon, title, description } = COPY[mode];

  return (
    <HStack spacing={12} modifiers={ROW_FILL}>
      <Icon name={icon} size={20} />
      <VStack alignment="leading" spacing={2}>
        <Text weight="medium">{title}</Text>
        <Text
          textStyle="subheadline"
          modifiers={[foregroundStyle("secondary")]}
        >
          {description}
        </Text>
      </VStack>
    </HStack>
  );
}
