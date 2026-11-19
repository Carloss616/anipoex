import { useFragment } from "@apollo/client/react";
import { useValue } from "@legendapp/state/react";
import { MangaBaseFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { pendingEntries$ } from "@/features/manga/state/pending-entries";

/** The manga's cached title and why AniList turned its progress down. */
export function useUnsentItem(mediaId: string) {
  const error = useValue(pendingEntries$[mediaId].error) ?? "";
  const { data } = useFragment({
    fragment: MangaBaseFragmentDoc,
    fragmentName: "MangaBase",
    from: { __typename: "Media", id: Number(mediaId) },
  });

  return { title: data?.title?.userPreferred ?? `Manga ${mediaId}`, error };
}
