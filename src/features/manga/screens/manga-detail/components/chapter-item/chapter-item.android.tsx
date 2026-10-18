import { IconButton, ListItem } from "@expo/ui/jetpack-compose";
import { alpha, semantics } from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import { noop } from "@/utils/utils";
import type { ChapterItemProps } from "./chapter-item";

export function ChapterItem({ chapter, entryId }: ChapterItemProps) {
  // Per row, not per screen: a progress change re-renders the rows only.
  const read = (useTrackingEntry(entryId)?.progress ?? 0) > chapter.id;

  return (
    <ListItem
      colors={{ containerColor: "transparent" }}
      modifiers={read ? [alpha(0.64)] : []}
    >
      <ListItem.HeadlineContent>
        <Text style={{ fontWeight: "500" }}>{chapter.title}</Text>
      </ListItem.HeadlineContent>
      <ListItem.SupportingContent>
        <Text style={{ typography: "bodyMedium" }}>{chapter.date}</Text>
      </ListItem.SupportingContent>
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
