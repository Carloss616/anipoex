import { IconButton, Row } from "@expo/ui/jetpack-compose";
import { alpha, semantics } from "@expo/ui/jetpack-compose/modifiers";
import { useRouter } from "expo-router";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { noop } from "@/utils/utils";
import type { ChapterItemProps } from "./chapter-item";
import { useChapterRead } from "./hooks/use-chapter-read";
import { useIsNext } from "./hooks/use-is-next";

export function ChapterItem({
  chapter,
  mediaId,
  entryId,
  continue$,
  index = 0,
  count = 1,
}: ChapterItemProps) {
  const router = useRouter();
  const read = useChapterRead(entryId, chapter.number);
  const next = useIsNext(continue$, chapter.id);
  const m3 = useThemeM3Colors();

  return (
    <ContextMenu
      items={[{ label: "Download", icon: Icons.download, onPress: noop }]}
    >
      <SegmentedListItem
        index={index}
        count={count}
        containerColor={m3.surfaceContainerLow}
        onPress={() =>
          router.push({
            pathname: "/manga/[id]/reader",
            params: { id: mediaId, chapter: chapter.id },
          })
        }
        modifiers={read ? [alpha(0.64)] : []}
      >
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 6 }}>
          {read && (
            <Icon
              name={Icons.read}
              size={14}
              color={m3.primary}
              modifiers={[semantics({ contentDescription: "Read" })]}
            />
          )}
          {next && <Badge color="primary" />}
          <Text style={{ fontWeight: "500" }} maxLines={1} overflow="ellipsis">
            {chapter.title}
          </Text>
        </Row>
        {/* An empty slot still takes a line and lifts the title off center. */}
        {chapter.date !== "" && (
          <SegmentedListItem.Supporting>
            <Text style={{ typography: "bodyMedium" }}>{chapter.date}</Text>
          </SegmentedListItem.Supporting>
        )}
        <SegmentedListItem.Trailing>
          <Row
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: 4 }}
          >
            {next && <Badge color="primary">Next</Badge>}
            <IconButton
              onClick={noop}
              modifiers={[
                semantics({
                  contentDescription: `Download chapter ${chapter.title}`,
                }),
              ]}
            >
              <Icon name={Icons.download} color="inherit" />
            </IconButton>
          </Row>
        </SegmentedListItem.Trailing>
      </SegmentedListItem>
    </ContextMenu>
  );
}
