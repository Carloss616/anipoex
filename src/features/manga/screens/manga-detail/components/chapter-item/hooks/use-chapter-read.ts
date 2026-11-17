import { useApolloClient } from "@apollo/client/react";
import { useValue } from "@legendapp/state/react";
import { useSyncExternalStore } from "react";
import { MangaTrackingFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { pendingEntries$ } from "@/features/manga/state/pending-entries";
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
  // As in effectiveProgress: a hand-set progress or a removal replaces
  // AniList's; reading only raises it, so read by either is read.
  const pendingRead = useValue(() => {
    const pending = pendingEntries$[mediaId].get();
    const set = pending?.remove ? 0 : pending?.edits?.progress;
    if (set !== undefined) return isRead(set, chapter) ? "read" : "unread";
    return isRead(pending?.progress ?? 0, chapter) ? "read" : "";
  });

  return pendingRead ? pendingRead === "read" : remoteRead;
}
