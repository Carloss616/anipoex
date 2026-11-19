import { Box, Column } from "@expo/ui/jetpack-compose";
import {
  clip,
  padding,
  Shapes,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { memo } from "react";
import { GUTTER } from "@/components/native/constants";
import { Image } from "@/components/native/jetpack-compose/image";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { openManga } from "../../utils/row-menu";
import { usePendingIds } from "./hooks/use-pending-ids";
import { usePendingRow } from "./hooks/use-pending-row";
import type { PendingRowsProps } from "./pending-rows";

/** Changes made offline that AniList doesn't have yet, above the activity. */
export function PendingRows({ mediaId }: PendingRowsProps) {
  const ids = usePendingIds(mediaId);
  const m3 = useThemeM3Colors();
  if (ids.length === 0) return null;

  return (
    <Column>
      <Text
        style={{ typography: "titleSmall" }}
        color={m3.primary}
        modifiers={[padding(GUTTER, 16, GUTTER, 8)]}
      >
        Waiting to sync
      </Text>
      {ids.map((id, index) => (
        <PendingRow key={id} mediaId={id} index={index} count={ids.length} />
      ))}
    </Column>
  );
}

const PendingRow = memo(function PendingRow({
  mediaId,
  index,
  count,
}: {
  mediaId: string;
  index: number;
  count: number;
}) {
  const { title, cover, action } = usePendingRow(mediaId);
  const m3 = useThemeM3Colors();

  return (
    <Box
      modifiers={[padding(GUTTER, index > 0 ? SEGMENTED_GAP : 0, GUTTER, 0)]}
    >
      <SegmentedListItem
        index={index}
        count={count}
        colors={{ containerColor: m3.surfaceContainerHigh }}
        onPress={() => openManga(Number(mediaId))}
      >
        <SegmentedListItem.Leading>
          {cover?.medium ? (
            <Image
              source={{ uri: cover.medium }}
              modifiers={[size(34, 50), clip(Shapes.RoundedCorner(6))]}
            />
          ) : (
            <Box modifiers={[size(34, 50)]} />
          )}
        </SegmentedListItem.Leading>
        <Text maxLines={1} overflow="ellipsis" style={{ fontWeight: "500" }}>
          {title}
        </Text>
        <SegmentedListItem.Supporting>
          <Text style={{ typography: "bodyMedium" }}>{action}</Text>
        </SegmentedListItem.Supporting>
        <SegmentedListItem.Trailing>
          <Icon name={Icons.offline} size={18} color={m3.onSurfaceVariant} />
        </SegmentedListItem.Trailing>
      </SegmentedListItem>
    </Box>
  );
});
