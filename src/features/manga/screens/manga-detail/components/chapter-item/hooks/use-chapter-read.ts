import { useApolloClient } from "@apollo/client/react";
import { useValue } from "@legendapp/state/react";
import { useSyncExternalStore } from "react";
import { MangaTrackingFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { pendingProgress$ } from "@/features/manga/state/pending-progress";
import { isRead } from "@/features/manga/utils/to-chapters";

const FRAGMENT = {
  fragment: MangaTrackingFragmentDoc,
  fragmentName: "MangaTracking",
} as const;

/**
 * Whether it's read, by AniList's progress or the one kept offline: a change
 * of either re-renders only the rows it flips.
 */
export function useChapterRead(
  mediaId: number,
  entryId: number | null | undefined,
  chapter: number,
) {
  const { cache } = useApolloClient();
  const id = entryId == null ? undefined : `MediaList:${entryId}`;

  const remoteRead = useSyncExternalStore(
    (notify) => {
      if (!id) return () => {};
      const sub = cache
        .watchFragment({ ...FRAGMENT, from: id })
        .subscribe(notify);
      return () => sub.unsubscribe();
    },
    () =>
      isRead(
        (id && cache.readFragment({ ...FRAGMENT, id })?.progress) || 0,
        chapter,
      ),
  );
  // Read by either progress is read by the higher one: isRead grows with it.
  const pendingRead = useValue(() =>
    isRead(pendingProgress$[mediaId].progress.get() ?? 0, chapter),
  );

  return remoteRead || pendingRead;
}
