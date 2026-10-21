import { IconButton, ListItem } from "@expo/ui/jetpack-compose";
import {
  alpha,
  clickable,
  semantics,
} from "@expo/ui/jetpack-compose/modifiers";
import { useRouter } from "expo-router";
import { Text } from "@/components/native/jetpack-compose/text";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { noop } from "@/utils/utils";
import type { ChapterItemProps } from "./chapter-item";
import { useChapterRead } from "./hooks/use-chapter-read";

export function ChapterItem({ chapter, mediaId, entryId }: ChapterItemProps) {
  const router = useRouter();
  const read = useChapterRead(entryId, chapter.number);

  return (
    <ListItem
      colors={{ containerColor: "transparent" }}
      modifiers={[
        clickable(() =>
          router.push({
            pathname: "/reader",
            params: {
              mediaId,
              chapter: chapter.id,
              title: chapter.title,
              memo: chapter.memo ?? undefined,
            },
          }),
        ),
        ...(read ? [alpha(0.64)] : []),
      ]}
    >
      <ListItem.HeadlineContent>
        <Text style={{ fontWeight: "500" }}>{chapter.title}</Text>
      </ListItem.HeadlineContent>
      {/* An empty slot still takes a line and lifts the title off center. */}
      {chapter.date !== "" && (
        <ListItem.SupportingContent>
          <Text style={{ typography: "bodyMedium" }}>{chapter.date}</Text>
        </ListItem.SupportingContent>
      )}
      <ListItem.TrailingContent>
        <IconButton
          onClick={noop}
          modifiers={[
            semantics({
              contentDescription: `Download chapter ${chapter.title}`,
            }),
          ]}
        >
          <Icon name={Icons.download} size={BUTTON_ICON_SIZE} color="inherit" />
        </IconButton>
      </ListItem.TrailingContent>
    </ListItem>
  );
}
