import { Box } from "@expo/ui/jetpack-compose";
import {
  clip,
  padding,
  Shapes,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { router } from "expo-router";
import { memo } from "react";
import { GUTTER } from "@/components/native/constants";
import { Image } from "@/components/native/jetpack-compose/image";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { ContextMenu } from "@/components/ui/menu";
import { discardItem } from "@/features/activity/screens/activity/utils/row-menu";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { EntryItemProps } from "./entry-item";
import { useEntryItem } from "./hooks/use-entry-item";

export const EntryItem = memo(function EntryItem({
  id,
  index = 0,
  count = 1,
}: EntryItemProps) {
  const { title, cover, summary } = useEntryItem(id);
  const m3 = useThemeM3Colors();

  return (
    <Box
      modifiers={[padding(GUTTER, index > 0 ? SEGMENTED_GAP : 0, GUTTER, 0)]}
    >
      <ContextMenu items={[discardItem(id)]}>
        <SegmentedListItem
          index={index}
          count={count}
          colors={{ containerColor: m3.surfaceContainerHigh }}
          onPress={() => router.navigate(`/manga/${id}`)}
        >
          <SegmentedListItem.Leading>
            {cover ? (
              <Image
                source={{ uri: cover }}
                modifiers={[size(28, 40), clip(Shapes.RoundedCorner(6))]}
              />
            ) : (
              <Box modifiers={[size(28, 40)]} />
            )}
          </SegmentedListItem.Leading>
          <Text maxLines={1} overflow="ellipsis">
            {title}
          </Text>
          <SegmentedListItem.Supporting>
            <Text
              style={{ typography: "bodyMedium" }}
              maxLines={2}
              overflow="ellipsis"
            >
              {summary}
            </Text>
          </SegmentedListItem.Supporting>
        </SegmentedListItem>
      </ContextMenu>
    </Box>
  );
});
