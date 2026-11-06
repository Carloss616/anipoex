import {
  skipToken,
  useApolloClient,
  useFragment,
  useQuery,
} from "@apollo/client/react";
import { useCallback, useState } from "react";
import { MangaDetailDocument } from "../graphql/manga-detail.generated";
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
    MangaDetailDocument,
    !valid || cached.complete
      ? skipToken
      : { variables: { id: mediaId }, context: CONTEXT },
  );

  // Skipped once the cache is complete, the query has no `refetch`; the
  // client hits the network and the fragment above picks the data up.
  const refresh = useCallback(() => {
    if (!valid) return;

    setRefreshing(true);
    return (
      client
        .query({
          query: MangaDetailDocument,
          variables: { id: mediaId },
          fetchPolicy: "network-only",
          context: CONTEXT,
        })
        // The error link already toasts it; rejecting would go unhandled.
        .catch(() => {})
        .finally(() => setRefreshing(false))
    );
  }, [client, mediaId, valid]);

  // `cached.data` is partial when incomplete, so the list's half paints now and
  // the fetch fills the rest in. Once complete it wins: the query spreads its
  // fragment `@nonreactive`, so its data never sees a later save.
  const media = cached.complete ? cached.data : (data?.Media ?? cached.data);

  return { manga: toDetail(mediaId, media), loading, refreshing, refresh };
}
