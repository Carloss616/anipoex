import { useRouter } from "expo-router";
import { cn } from "panelui-native/utils/cn";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import { noop } from "@/utils/utils";
import { useChapterRead } from "./hooks/use-chapter-read";

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
  const read = useChapterRead(entryId, chapter.number);

  return (
    <View>
      <Item
        onPress={() =>
          router.push({
            pathname: "/manga/[id]/reader",
            params: {
              id: mediaId,
              chapter: chapter.id,
            },
          })
        }
        // Dimmed, not `disabled`: a read chapter still opens.
        className={cn("pe-17", read && "opacity-[0.64]")}
      >
        <Item.Content>
          <Item.Title numberOfLines={1}>{chapter.title}</Item.Title>
          <Item.Description>{chapter.date}</Item.Description>
        </Item.Content>
      </Item>
      {/* Over the row, not in it: a <button> can't hold buttons. */}
      <Item.Actions className="absolute inset-e-4 inset-y-0">
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
    </View>
  );
}
