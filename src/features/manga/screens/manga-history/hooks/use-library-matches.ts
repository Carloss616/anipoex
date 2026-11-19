import { skipToken, useQuery } from "@apollo/client/react";
import type { ObservablePrimitive } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useMemo } from "react";
import { MangaListDocument } from "@/features/manga/graphql/manga-list.generated";
import { wholeCollection } from "@/features/manga/utils/file-entry";
import { matchesQuery } from "@/features/manga/utils/matches-query";
import { toEntries } from "@/features/manga/utils/to-entries";
import { session$ } from "@/state/session";

const LIMIT = 8;

/** The manga in the viewer's lists whose title or synonym holds the search. */
export function useLibraryMatches(query$: ObservablePrimitive<string>) {
  const userId = useValue(session$.user)?.id;
  const needle = useValue(() => query$.get().trim().toLowerCase());
  const { data, loading } = useQuery(
    MangaListDocument,
    userId == null
      ? skipToken
      : { variables: wholeCollection(userId), fetchPolicy: "cache-first" },
  );

  const matches = useMemo(
    () =>
      needle
        ? toEntries(data)
            .filter((m) => matchesQuery(m, needle))
            .slice(0, LIMIT)
        : [],
    [data, needle],
  );

  return { matches, loading: loading && !data };
}
