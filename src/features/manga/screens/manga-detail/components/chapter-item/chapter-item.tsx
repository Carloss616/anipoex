import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import { type Chapter, isRead } from "@/features/manga/utils/to-chapters";
import { noop } from "@/utils/utils";

export interface ChapterItemProps {
  chapter: Chapter;
  /** The AniList id the reader opens with. */
  mediaId: number;
  /** The list entry; chapters up to its progress are dimmed. */
  entryId: number | null | undefined;
}

/** One chapter row; the list around it draws the card. */
export function ChapterItem({ chapter, mediaId, entryId }: ChapterItemProps) {
  const router = useRouter();
  // Per row, not per screen: a progress change re-renders the rows only.
  const progress = useTrackingEntry(entryId)?.progress ?? 0;

  return (
    <Item
      // Dimmed, not `disabled`: a read chapter still opens.
      className={
        isRead(progress, chapter.number) ? "opacity-[0.64]" : undefined
      }
    >
      {/* Under the row rather than around it: a <button> can't hold the download button. */}
      <Pressable
        className="absolute inset-0 rounded-xl"
        accessibilityRole="button"
        accessibilityLabel={chapter.title}
        onPress={() =>
          router.push({
            pathname: "/reader",
            params: { mediaId, chapter: chapter.id },
          })
        }
      />
      <Item.Content className="pointer-events-none">
        <Item.Title>{chapter.title}</Item.Title>
        <Item.Description>{chapter.date}</Item.Description>
      </Item.Content>
      <Item.Actions>
        <Button
          size="icon"
          className="size-9"
          variant="outline"
          onPress={noop}
          accessibilityLabel={`Download chapter ${chapter.title}`}
        >
          <Icon
            name={Icons.download}
            size={BUTTON_ICON_SIZE}
            className="text-primary"
          />
        </Button>
      </Item.Actions>
    </Item>
  );
}
