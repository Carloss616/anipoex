import { Box } from "@expo/ui/jetpack-compose";
import { padding } from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { GUTTER } from "@/components/native/constants";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { ContextMenu } from "@/components/ui/menu";
import { SourceTile } from "@/features/manga/components/source-tile";
import { activeScans$ } from "@/features/manga/state/active-scans";
import { sourceColor } from "@/features/manga/utils/source";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { themeMode$ } from "@/state/theme";
import { isBusy, sourceStatus } from "../../utils/progress";
import { sourceMenu } from "../../utils/row-menu";
import type { SourceItemProps } from "./source-item";

export const SourceItem = memo(function SourceItem({
  mangaId,
  sourceId,
  index = 0,
  count = 1,
}: SourceItemProps) {
  const mark = useValue(activeScans$[mangaId].marks[sourceId]);
  const mode = useValue(themeMode$);
  const m3 = useThemeM3Colors();
  if (!mark) return null;
  const status = sourceStatus(mark);
  const tone = {
    success: m3.primary,
    warning: m3.tertiary,
    destructive: m3.error,
    muted: m3.onSurfaceVariant,
  }[status.tone];
  const row = (
    <SegmentedListItem
      index={index}
      count={count}
      colors={{ containerColor: m3.surfaceContainer }}
    >
      <SegmentedListItem.Leading>
        <SourceTile
          initials={mark.initials}
          iconUrl={mark.iconUrl}
          color={sourceColor(mark, mode)}
          loading={mark.state === "scanning"}
        />
      </SegmentedListItem.Leading>
      <Text maxLines={1} overflow="ellipsis">
        {mark.name}
      </Text>
      <SegmentedListItem.Trailing>
        <Text style={{ typography: "labelLarge" }} color={tone}>
          {status.label}
        </Text>
      </SegmentedListItem.Trailing>
    </SegmentedListItem>
  );

  return (
    <Box modifiers={[padding(GUTTER + 16, SEGMENTED_GAP, GUTTER, 0)]}>
      {isBusy(mark) ? (
        <ContextMenu items={sourceMenu(Number(mangaId), sourceId)}>
          {row}
        </ContextMenu>
      ) : (
        row
      )}
    </Box>
  );
});
