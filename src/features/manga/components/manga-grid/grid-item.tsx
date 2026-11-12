import { useFragment } from "@apollo/client/react";
import { useValue } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { memo } from "react";
import { Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { isRuntimeAvailable } from "@/features/extensions";
import {
  MangaCard,
  type TitlePosition,
} from "@/features/manga/components/manga-card";
import { PUBLICATION_STATUSES } from "@/features/manga/constants";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { useUnreadCount } from "@/features/manga/hooks/use-unread-count";
import { scanManga } from "@/features/manga/state/library-scan";
import { isScanBusy } from "@/features/manga/state/probes";
import { mediaKey } from "@/features/manga/utils/msu";
import { toProgress } from "@/features/manga/utils/progress";
import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { MediaStatus } from "@/graphql/types.generated";

/**
 * Progress from the cache, so it updates without a refetch: shown, spoken,
 * and the chapters left in the chosen source.
 */
function useProgress({
  id,
  __typename,
}: Pick<MangaEntry, "id" | "__typename">) {
  const { data } = useFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: { __typename, id },
  });
  const read = data.mediaListEntry?.progress ?? 0;
  const unread = useUnreadCount(id, read);
  if (!data.mediaListEntry) {
    return {
      label: undefined,
      spoken: undefined,
      fraction: undefined,
      unread,
      read,
    };
  }
  return { ...toProgress(read, data.chapters), unread, read };
}

/**
 * On native it navigates on press, since `Link.Trigger` can't live in the
 * grid's Host. The label is a string: native `Text` drops component children.
 */
export const GridItem = memo(function GridItem({
  item,
  titlePosition,
  width,
}: {
  item: MangaEntry;
  titlePosition?: TitlePosition;
  /** Required in the native grids: the card's height comes from it. */
  width?: number;
}) {
  const router = useRouter();
  const progress = useProgress(item);
  // Any scan of the manga: a Scan all, a rescan or a title match.
  const scanning = useValue(() => isScanBusy(mediaKey(item.id)));
  const title = item.title?.userPreferred;

  const card = (
    <MangaCard
      style={width ? { width } : undefined}
      cover={item.coverImage?.medium}
      coverColor={item.coverImage?.color}
      // Most of a list is still releasing: only the exceptions get a tag.
      status={item.status === MediaStatus.Releasing ? undefined : item.status}
      title={title}
      label={progress.label}
      progress={progress.fraction}
      unread={progress.unread}
      scanning={scanning}
      titlePosition={titlePosition}
      tilt
      // The badge is a letter and the label a fraction: say both in words.
      accessibilityLabel={[
        title,
        item.status && PUBLICATION_STATUSES[item.status],
        progress.spoken,
        progress.unread === 0
          ? "up to date"
          : progress.unread && `${progress.unread} unread`,
        scanning && "scanning sources",
      ]
        .filter(Boolean)
        .join(", ")}
      testID={`manga-card-${item.id}`}
      onPress={() => router.push(`/manga/${item.id}`)}
    />
  );

  // A plain browser has no sources, so nothing to scan.
  if (!isRuntimeAvailable) return card;

  // The Reading toolbar's scan, for this manga alone.
  return (
    <ContextMenu
      items={[
        {
          heading: title ?? undefined,
          items: [
            {
              label: "Scan for new chapters",
              icon: Icons.scanList,
              disabled: scanning,
              onPress: () => void scanManga(item, progress.read),
            },
            {
              label: "Rescan everything",
              icon: Icons.refresh,
              disabled: scanning,
              onPress: () =>
                void scanManga(item, progress.read, { everything: true }),
            },
          ],
        },
      ]}
    >
      {card}
    </ContextMenu>
  );
});
