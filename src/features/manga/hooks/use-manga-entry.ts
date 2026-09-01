import {
  skipToken,
  useApolloClient,
  useFragment,
  useQuery,
} from "@apollo/client/react";
import { useCallback, useState } from "react";
import { MangaDocument } from "../graphql/manga.generated";
import { MangaDetailFragmentDoc } from "../graphql/manga-fragments.generated";
import { toDetail } from "../utils/to-detail";

const CONTEXT = { errorMessage: "Couldn't load this manga" };

export function useMangaEntry(id: string) {
  const mediaId = Number(id);
  const valid = Number.isInteger(mediaId);
  const client = useApolloClient();
  const [refreshing, setRefreshing] = useState(false);

  const cached = useFragment({
    fragment: MangaDetailFragmentDoc,
    fragmentName: "MangaDetail",
    from: { __typename: "Media", id: mediaId },
  });

  const { data, loading } = useQuery(
    MangaDocument,
    !valid || cached.complete
      ? skipToken
      : { variables: { id: mediaId }, context: CONTEXT },
  );

  // The query is skipped once the cache is complete, so it has no `refetch` to
  // hand back; going through the client hits the network either way and the
  // fragment above picks the fresh data up.
  const refresh = useCallback(() => {
    if (!valid) return;

    setRefreshing(true);
    client
      .query({
        query: MangaDocument,
        variables: { id: mediaId },
        fetchPolicy: "network-only",
        context: CONTEXT,
      })
      // The error link already toasts it; a rejection here would just be unhandled.
      .catch(() => {})
      .finally(() => setRefreshing(false));
  }, [client, mediaId, valid]);

  // `cached.data` is partial when incomplete, so the list's half paints now and
  // the fetch fills the rest in.
  const media = data?.Media ?? cached.data;

  return { manga: toDetail(mediaId, media), loading, refreshing, refresh };
}
