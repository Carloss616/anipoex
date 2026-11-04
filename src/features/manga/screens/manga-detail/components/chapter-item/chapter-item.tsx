import { useRouter } from "expo-router";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import { noop } from "@/utils/utils";
import type { Continue$ } from "../../hooks/use-continue";
import { useChapterRead } from "./hooks/use-chapter-read";
import { useIsNext } from "./hooks/use-is-next";

export interface ChapterItemProps {
  chapter: Chapter;
  /** The AniList id the reader opens with. */
  mediaId: number;
  /** The list entry; chapters up to its progress are dimmed. */
  entryId: number | null | undefined;
  continue$: Continue$;
}

/** One chapter row; the list around it draws the card. */
export function ChapterItem({
  chapter,
  mediaId,
  entryId,
  continue$,
}: ChapterItemProps) {
  const router = useRouter();
  const read = useChapterRead(entryId, chapter.number);
  const next = useIsNext(continue$, chapter.id);

  return (
    <View>
      <Frame.Row
        onClick={() =>
          router.push({
            pathname: "/manga/[id]/reader",
            params: {
              id: mediaId,
              chapter: chapter.id,
            },
          })
        }
        // Dimmed, not `disabled`: a read chapter still opens.
        className={cn(
          next ? "pe-28.75" : "pe-17",
          read && "opacity-[0.64]",
          next && "shadow-[inset_3px_0_0_var(--color-primary)]",
        )}
      >
        <Frame.Content>
          <View className="flex-row items-center gap-1.5">
            {read && (
              <Icon
                name={Icons.read}
                size={14}
                className="text-primary"
                accessibilityLabel="Read"
              />
            )}
            <Frame.Title as="p" className="min-w-0 flex-1">
              {chapter.title}
            </Frame.Title>
          </View>
          <Frame.Description>{chapter.date}</Frame.Description>
        </Frame.Content>
      </Frame.Row>
      {/* Over the row, not in it: a <button> can't hold buttons. */}
      <Frame.Actions className="absolute inset-e-4 inset-y-0">
        {next && <Badge color="primary">Next</Badge>}
        <Button
          size="icon"
          variant="ghost"
          onClick={noop}
          aria-label={`Download chapter ${chapter.title}`}
        >
          <Icon name={Icons.download} size={BUTTON_ICON_SIZE} />
        </Button>
      </Frame.Actions>
    </View>
  );
}
