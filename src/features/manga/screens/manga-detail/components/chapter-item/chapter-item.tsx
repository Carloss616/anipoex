import { Computed } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { ProgressRing } from "@/components/ui/progress-ring";
import { downloadFraction, type QueuedDownload } from "@/features/downloads";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import type { Continue$ } from "../../hooks/use-continue";
import { useChapterDownload } from "./hooks/use-chapter-download";
import { useChapterRead } from "./hooks/use-chapter-read";
import { useIsNext } from "./hooks/use-is-next";
import { deleteItem, downloadLabel, STATE_ICONS } from "./utils/download-items";

export interface ChapterItemProps {
  chapter: Chapter;
  /** What a download is filed under; its id is the one the reader opens with. */
  manga: QueuedDownload["manga"];
  /** The matched source; no download actions without one. */
  source: QueuedDownload["source"] | undefined;
  /** The list entry; chapters up to its progress are dimmed. */
  entryId: number | null | undefined;
  continue$: Continue$;
  /**
   * Its place in the list, for its corners.
   * @platform android
   */
  index?: number;
  /** @platform android */
  count?: number;
}

/** One chapter row; the list around it draws the card. */
export const ChapterItem = memo(function ChapterItem({
  chapter,
  manga,
  source,
  entryId,
  continue$,
}: ChapterItemProps) {
  const router = useRouter();
  const read = useChapterRead(manga.id, entryId, chapter.number);
  const next = useIsNext(continue$, chapter.id);
  const download = useChapterDownload(manga, source, chapter);
  const { state } = download;

  return (
    <View>
      <Frame.Row
        onClick={() =>
          router.push({
            pathname: "/manga/[id]/reader",
            params: {
              id: manga.id,
              chapter: chapter.id,
            },
          })
        }
        // Dimmed, not `disabled`: a read chapter still opens.
        className={cn(
          // Room for the actions: Next's badge and the download button.
          next && source ? "pe-28.75" : next ? "pe-18.25" : source && "pe-17",
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
      <Frame.Actions className="absolute inset-y-0 inset-e-4">
        {next && <Badge color="primary">Next</Badge>}
        {source &&
          (state === "local" || state === "cloud" ? (
            <Menu items={[deleteItem(download.actions.remove)]}>
              <Button
                size="icon"
                variant="ghost"
                shape="pill"
                aria-label={downloadLabel(state, chapter.title)}
              >
                <Icon name={STATE_ICONS[state]} className="text-primary" />
              </Button>
            </Menu>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              onClick={download.press}
              shape="pill"
              aria-label={downloadLabel(state, chapter.title)}
            >
              {state === "running" || state === "paused" ? (
                <Computed>
                  {() => (
                    <ProgressRing
                      value={downloadFraction(download.key)}
                      size={24}
                      icon={state === "running" ? Icons.pause : Icons.play}
                    />
                  )}
                </Computed>
              ) : (
                <Icon
                  name={STATE_ICONS[state]}
                  className={cn(state === "failed" && "text-destructive")}
                />
              )}
            </Button>
          ))}
      </Frame.Actions>
    </View>
  );
});
