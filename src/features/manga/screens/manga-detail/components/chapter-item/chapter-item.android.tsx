import { IconButton, Row } from "@expo/ui/jetpack-compose";
import { alpha, semantics } from "@expo/ui/jetpack-compose/modifiers";
import { Computed } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { memo } from "react";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu, Menu } from "@/components/ui/menu";
import { ProgressRing } from "@/components/ui/progress-ring";
import { type DownloadState, downloadProgress$ } from "@/features/downloads";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { ChapterItemProps } from "./chapter-item";
import { useChapterDownload } from "./hooks/use-chapter-download";
import { useChapterRead } from "./hooks/use-chapter-read";
import { useIsNext } from "./hooks/use-is-next";
import { deleteItem, downloadLabel, STATE_ICONS } from "./utils/download-items";

export const ChapterItem = memo(function ChapterItem({
  chapter,
  manga,
  source,
  entryId,
  continue$,
  index = 0,
  count = 1,
}: ChapterItemProps) {
  const router = useRouter();
  const read = useChapterRead(manga.id, entryId, chapter.number);
  const next = useIsNext(continue$, chapter.id);
  const m3 = useThemeM3Colors();
  const download = useChapterDownload(manga, source, chapter);
  const { state } = download;
  const label = downloadLabel(state, chapter.title);

  const row = (
    <SegmentedListItem
      index={index}
      count={count}
      colors={{ containerColor: m3.surfaceContainerLow }}
      onPress={() =>
        router.push({
          pathname: "/manga/[id]/reader",
          params: { id: manga.id, chapter: chapter.id },
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
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 4 }}>
          {next && <Badge color="primary">Next</Badge>}
          {source &&
            (state === "local" || state === "cloud" ? (
              <Menu items={[deleteItem(download.actions.remove)]}>
                <DownloadButton state={state} label={label} />
              </Menu>
            ) : (
              <DownloadButton
                state={state}
                label={label}
                progressKey={download.key}
                onPress={download.press}
              />
            ))}
        </Row>
      </SegmentedListItem.Trailing>
    </SegmentedListItem>
  );

  return download.items.length > 0 ? (
    <ContextMenu items={download.items}>{row}</ContextMenu>
  ) : (
    row
  );
});

/** An icon per state; a ring of the pages downloaded while it runs. */
function DownloadButton({
  state,
  label,
  progressKey = "",
  onPress,
}: {
  state: DownloadState;
  label: string;
  progressKey?: string;
  /** Set by a `Menu` when it wraps the button. */
  onPress?: () => void;
}) {
  const m3 = useThemeM3Colors();

  return (
    <IconButton
      onClick={onPress}
      modifiers={[semantics({ contentDescription: label })]}
    >
      {state === "running" ? (
        <Computed>
          {() => (
            <ProgressRing value={downloadProgress$[progressKey].get() ?? 0} />
          )}
        </Computed>
      ) : (
        <Icon
          name={STATE_ICONS[state]}
          color={
            state === "failed"
              ? m3.error
              : state === "local" || state === "cloud"
                ? m3.primary
                : "inherit"
          }
        />
      )}
    </IconButton>
  );
}
