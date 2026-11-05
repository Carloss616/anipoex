import { skipToken, useFragment, useQuery } from "@apollo/client/react";
import { useValue } from "@legendapp/state/react";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { chapters$, chaptersKey } from "@/features/manga/state/chapters";
import { source$ } from "@/features/manga/state/source";
import type { StoredChapters } from "@/features/manga/utils/chapter-storage";
import {
  readMatch,
  type SourceMatch,
} from "@/features/manga/utils/source-match";
import { ContinueMediaDocument } from "../graphql/continue-media.generated";
import { type ContinueItem, continueItems } from "../utils/continue-items";

/** Mangas with a selected source and chapters past their AniList progress. */
export function useContinueReading(): ContinueItem[] {
  // Only a matched page with its stored list can continue: progress is asked
  // for these alone, not for every manga a source was ever picked for.
  const idsKey = useValue(() =>
    Object.keys(source$.get())
      .map(Number)
      .filter((id) => {
        const match = readMatch(source$[id].get());
        if (!match?.manga) return false;
        const stored = chapters$[chaptersKey(id, match.sourceId)].get();
        return stored?.manga.url === match.manga.url;
      })
      .join(),
  );
  const ids = idsKey ? idsKey.split(",").map(Number) : [];

  // Fills the cache; the query spreads MangaMedia `@nonreactive`, so progress
  // is read through the fragment, which updates when the reader saves.
  useQuery(
    ContinueMediaDocument,
    ids.length
      ? {
          variables: { ids },
          fetchPolicy: "cache-first",
          context: { silent: true },
        }
      : skipToken,
  );
  const { data } = useFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: ids.map((id) => ({ __typename: "Media", id })),
  });
  const progress: Record<number, number | undefined> = {};
  ids.forEach((id, i) => {
    progress[id] = data[i]?.mediaListEntry?.progress ?? undefined;
  });

  // A string, so a change to a list that moves no item re-renders nothing.
  const itemsKey = useValue(() => {
    const matches: Record<number, SourceMatch | undefined> = {};
    const stored: Record<number, StoredChapters | undefined> = {};
    for (const id of ids) {
      const match = readMatch(source$[id].get());
      matches[id] = match;
      if (match) stored[id] = chapters$[chaptersKey(id, match.sourceId)].get();
    }
    return JSON.stringify(continueItems({ matches, stored, progress }));
  });
  return JSON.parse(itemsKey) as ContinueItem[];
}
