import { Box } from "@expo/ui/jetpack-compose";
import {
  align,
  background,
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
import { Icon } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { KIND_ICON } from "../../constants";
import {
  activityTime,
  historyAction,
  historyKind,
} from "../../utils/history-action";
import { openManga, rowMenu } from "../../utils/row-menu";
import type { HistoryRowProps } from "./history-row";

/** A segmented row of its day's group: tap opens the manga, long-press can filter by it. */
export const HistoryRow = memo(function HistoryRow({
  activity,
  first,
  last,
  filtered,
}: HistoryRowProps) {
  const m3 = useThemeM3Colors();
  const { media } = activity;
  const kind = historyKind(activity.status);
  const cover = media?.coverImage?.medium;
  const index = first ? 0 : 1;
  const tint = {
    read: m3.primary,
    add: m3.tertiary,
    done: m3.secondary,
    pause: m3.outline,
    drop: m3.error,
  }[kind];

  const row = (
    <SegmentedListItem
      index={index}
      count={last ? index + 1 : index + 2}
      colors={{ containerColor: m3.surfaceContainer }}
      onPress={media ? () => openManga(media.id) : undefined}
    >
      <SegmentedListItem.Leading>
        <Box modifiers={[size(40, 56)]}>
          {cover ? (
            <Image
              source={{ uri: cover }}
              modifiers={[size(34, 50), clip(Shapes.RoundedCorner(6))]}
            />
          ) : null}
          <Box
            contentAlignment="center"
            modifiers={[
              align("bottomEnd"),
              size(20, 20),
              clip(Shapes.Circle),
              background(m3.surfaceContainer),
            ]}
          >
            <Box
              contentAlignment="center"
              modifiers={[size(16, 16), clip(Shapes.Circle), background(tint)]}
            >
              <Icon name={KIND_ICON[kind]} size={10} color={m3.surface} />
            </Box>
          </Box>
        </Box>
      </SegmentedListItem.Leading>
      <Text maxLines={1} overflow="ellipsis" style={{ fontWeight: "500" }}>
        {media?.title?.userPreferred ?? ""}
      </Text>
      <SegmentedListItem.Supporting>
        <Text
          style={{ typography: "bodyMedium" }}
          maxLines={1}
          overflow="ellipsis"
        >
          {historyAction(activity)}
        </Text>
      </SegmentedListItem.Supporting>
      <SegmentedListItem.Trailing>
        <Text style={{ typography: "labelMedium" }} color={m3.onSurfaceVariant}>
          {activityTime(activity.createdAt)}
        </Text>
      </SegmentedListItem.Trailing>
    </SegmentedListItem>
  );

  return (
    <Box modifiers={[padding(GUTTER, first ? 0 : SEGMENTED_GAP, GUTTER, 0)]}>
      {media ? (
        <ContextMenu items={rowMenu(media.id, filtered)}>{row}</ContextMenu>
      ) : (
        row
      )}
    </Box>
  );
});
