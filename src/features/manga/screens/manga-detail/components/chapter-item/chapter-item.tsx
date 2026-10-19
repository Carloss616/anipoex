import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import { type Chapter, isRead } from "@/features/manga/utils/to-chapters";
import { noop } from "@/utils/utils";

export interface ChapterItemProps {
  chapter: Chapter;
  /** The list entry; chapters under its progress are dimmed. */
  entryId: number | null | undefined;
}

/** One chapter row; the list around it draws the card. */
export function ChapterItem({ chapter, entryId }: ChapterItemProps) {
  // Per row, not per screen: a progress change re-renders the rows only.
  const progress = useTrackingEntry(entryId)?.progress ?? 0;

  return (
    <Item disabled={isRead(progress, chapter.number)}>
      <Item.Content>
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
