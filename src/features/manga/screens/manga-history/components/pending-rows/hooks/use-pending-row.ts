import { useFragment } from "@apollo/client/react";
import { useValue } from "@legendapp/state/react";
import { MangaBaseFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { pendingEntries$ } from "@/features/manga/state/pending-entries";
import { pendingAction } from "../../../utils/history-action";

/** A kept change's manga, from the cache, and what it will send. */
export function usePendingRow(mediaId: string) {
  const action = useValue(() => {
    const entry = pendingEntries$[mediaId].get();
    return entry ? pendingAction(entry) : "";
  });
  const { data } = useFragment({
    fragment: MangaBaseFragmentDoc,
    fragmentName: "MangaBase",
    from: { __typename: "Media", id: Number(mediaId) },
  });

  return {
    title: data?.title?.userPreferred ?? `Manga ${mediaId}`,
    cover: data?.coverImage,
    action,
  };
}
