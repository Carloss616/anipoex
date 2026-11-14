import { Box, Row } from "@expo/ui/jetpack-compose";
import {
  clip,
  padding,
  Shapes,
  size,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { Memo, useValue } from "@legendapp/state/react";
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
import { readingQueue$ } from "@/features/manga/state/reading-queue";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { queuedMenu } from "../../utils/row-menu";
import { queuedIds, split } from "../../utils/state";
import type { QueueItemProps } from "./queue-item";

export const QueueItem = memo(function QueueItem({
  id,
  index = 0,
  count = 1,
}: QueueItemProps) {
  const item$ = readingQueue$[id];
  const name = useValue(item$.name) ?? "";
  const cover = useValue(item$.cover);
  const retry = useValue(() => item$.only.get()?.length ?? 0);
  const m3 = useThemeM3Colors();
  const open = () => router.navigate(`/manga/${item$.mangaId.peek()}`);

  return (
    <Box
      modifiers={[padding(GUTTER, index > 0 ? SEGMENTED_GAP : 0, GUTTER, 0)]}
    >
      <ContextMenu items={queuedMenu(id, open)}>
        <SegmentedListItem
          index={index}
          count={count}
          colors={{ containerColor: m3.surfaceContainerHigh }}
          onPress={open}
        >
          <SegmentedListItem.Leading>
            <Row verticalAlignment="center">
              <Memo>
                {() => (
                  <Text
                    style={{ typography: "labelLarge" }}
                    color={m3.onSurfaceVariant}
                    modifiers={[width(28)]}
                  >
                    {String(split(queuedIds()).indexOf(id) + 1)}
                  </Text>
                )}
              </Memo>
              {cover ? (
                <Image
                  source={{ uri: cover }}
                  modifiers={[size(28, 40), clip(Shapes.RoundedCorner(6))]}
                />
              ) : (
                <Box modifiers={[size(28, 40)]} />
              )}
            </Row>
          </SegmentedListItem.Leading>
          <Text maxLines={1} overflow="ellipsis">
            {name}
          </Text>
          {retry > 0 && (
            <SegmentedListItem.Supporting>
              <Text style={{ typography: "bodyMedium" }}>
                {`Retry of ${retry} source${retry > 1 ? "s" : ""}`}
              </Text>
            </SegmentedListItem.Supporting>
          )}
        </SegmentedListItem>
      </ContextMenu>
    </Box>
  );
});
