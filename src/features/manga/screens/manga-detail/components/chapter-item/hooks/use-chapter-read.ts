import { useApolloClient } from "@apollo/client/react";
import { useSyncExternalStore } from "react";
import { MangaTrackingFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { isRead } from "@/features/manga/utils/to-chapters";

const FRAGMENT = {
  fragment: MangaTrackingFragmentDoc,
  fragmentName: "MangaTracking",
} as const;

/** Whether the chapter is read: a progress change re-renders only the rows it flips. */
export function useChapterRead(
  entryId: number | null | undefined,
  chapter: number,
) {
  const { cache } = useApolloClient();
  const id = entryId == null ? undefined : `MediaList:${entryId}`;

  return useSyncExternalStore(
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
}
