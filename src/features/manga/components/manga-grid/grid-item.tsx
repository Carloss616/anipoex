import { useFragment } from "@apollo/client/react";
import { useRouter } from "expo-router";
import { memo } from "react";
import {
  MangaCard,
  type TitlePosition,
} from "@/features/manga/components/manga-card";
import { PUBLICATION_STATUSES } from "@/features/manga/constants";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { useUnreadCount } from "@/features/manga/hooks/use-unread-count";
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
  // A search result off the list has no progress to show.
  if (!data.mediaListEntry) {
    return { label: undefined, spoken: undefined, fraction: undefined, unread };
  }
  return { ...toProgress(read, data.chapters), unread };
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
  const title = item.title?.userPreferred;

  return (
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
      ]
        .filter(Boolean)
        .join(", ")}
      testID={`manga-card-${item.id}`}
      onPress={() => router.push(`/manga/${item.id}`)}
    />
  );
});
