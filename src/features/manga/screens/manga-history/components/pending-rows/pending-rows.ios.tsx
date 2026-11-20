import { Button, HStack, Section, Spacer, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  clipShape,
  foregroundStyle,
  frame,
  lineLimit,
  listRowBackground,
} from "@expo/ui/swift-ui/modifiers";
import { memo } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { useThemeColor } from "@/hooks/use-theme-color";
import { openManga } from "../../utils/row-menu";
import { usePendingIds } from "./hooks/use-pending-ids";
import { usePendingRow } from "./hooks/use-pending-row";
import type { PendingRowsProps } from "./pending-rows";

/** Changes made offline that AniList doesn't have yet, as the list's first section. */
export function PendingRows({ mediaId }: PendingRowsProps) {
  const ids = usePendingIds(mediaId);
  const rowBackground = listRowBackground(useThemeColor("surface-secondary"));
  if (ids.length === 0) return null;

  return (
    <Section modifiers={[rowBackground]} header={<Text>Waiting to sync</Text>}>
      {ids.map((id) => (
        <PendingRow key={id} mediaId={id} />
      ))}
    </Section>
  );
}

const PendingRow = memo(function PendingRow({ mediaId }: { mediaId: string }) {
  const { title, cover, action } = usePendingRow(mediaId);

  return (
    <Button
      onPress={() => openManga(Number(mediaId))}
      modifiers={[buttonStyle("plain")]}
    >
      <HStack spacing={12} modifiers={ROW_FILL}>
        {cover?.medium ? (
          <Image
            source={{ uri: cover.medium }}
            modifiers={[
              frame({ width: 34, height: 50 }),
              clipShape("roundedRectangle", 6),
            ]}
          />
        ) : null}
        <VStack alignment="leading" spacing={2}>
          <Text weight="semibold" modifiers={[lineLimit(1)]}>
            {title}
          </Text>
          <Text
            textStyle="subheadline"
            modifiers={[foregroundStyle("secondary")]}
          >
            {action}
          </Text>
        </VStack>
        <Spacer />
        <Icon name={Icons.offline} size={16} muted />
      </HStack>
    </Button>
  );
});
