import { useFragment } from "@apollo/client/react";
import { useValue } from "@legendapp/state/react";
import { MangaBaseFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { pendingEntries$ } from "@/features/manga/state/pending-entries";
import { remoteOf } from "@/features/manga/state/send-pending";
import { pendingSummary } from "../../../utils/summary";

/** The manga's cached title and cover, and one line for what waits. */
export function useEntryItem(mediaId: string) {
  const summary = useValue(() => {
    const pending = pendingEntries$[mediaId].get();
    return pending ? pendingSummary(pending, remoteOf(Number(mediaId))) : "";
  });
  const { data } = useFragment({
    fragment: MangaBaseFragmentDoc,
    fragmentName: "MangaBase",
    from: { __typename: "Media", id: Number(mediaId) },
  });

  return {
    title: data?.title?.userPreferred ?? `Manga ${mediaId}`,
    cover: data?.coverImage?.medium,
    summary,
  };
}
