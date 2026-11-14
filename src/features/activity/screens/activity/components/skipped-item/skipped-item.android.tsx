import { Box, IconButton } from "@expo/ui/jetpack-compose";
import { padding } from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { GUTTER } from "@/components/native/constants";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { readingRun$ } from "@/features/manga/state/reading-queue";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { retrySkipped } from "../../utils/actions";
import { skippedMenu } from "../../utils/row-menu";
import type { SkippedItemProps } from "./skipped-item";

export const SkippedItem = memo(function SkippedItem({
  sourceId,
  index = 0,
  count = 1,
}: SkippedItemProps) {
  const skipped$ = readingRun$.skipped[sourceId];
  const name = useValue(skipped$.name) ?? "";
  const manga = useValue(() => skipped$.mangaIds.get()?.length ?? 0);
  const m3 = useThemeM3Colors();

  return (
    <Box
      modifiers={[padding(GUTTER, index > 0 ? SEGMENTED_GAP : 0, GUTTER, 0)]}
    >
      <ContextMenu items={skippedMenu(sourceId)}>
        <SegmentedListItem
          index={index}
          count={count}
          colors={{ containerColor: m3.surfaceContainerHigh }}
        >
          <Text maxLines={1} overflow="ellipsis">
            {name}
          </Text>
          <SegmentedListItem.Supporting>
            <Text style={{ typography: "bodyMedium" }}>
              {`In ${manga} manga`}
            </Text>
          </SegmentedListItem.Supporting>
          <SegmentedListItem.Trailing>
            <IconButton onClick={() => retrySkipped(sourceId)}>
              <Icon name={Icons.refresh} color="inherit" />
            </IconButton>
          </SegmentedListItem.Trailing>
        </SegmentedListItem>
      </ContextMenu>
    </Box>
  );
});
