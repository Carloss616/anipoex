import { NetworkStatus } from "@apollo/client";
import { skipToken, useFragment, useQuery } from "@apollo/client/react";
import { MangaDocument } from "../graphql/manga.generated";
import { MangaDetailFragmentDoc } from "../graphql/manga-fragments.generated";
import { toDetail } from "../utils/to-detail";

export function useMangaEntry(id: string) {
  const mediaId = Number(id);
  const valid = Number.isInteger(mediaId);

  const cached = useFragment({
    fragment: MangaDetailFragmentDoc,
    fragmentName: "MangaDetail",
    from: { __typename: "Media", id: mediaId },
  });

  const { data, loading, networkStatus } = useQuery(
    MangaDocument,
    !valid || cached.complete
      ? skipToken
      : {
          variables: { id: mediaId },
          context: { errorMessage: "Couldn't load this manga" },
        },
  );

  // `cached.data` is partial when incomplete, so the list's half paints now and
  // the fetch fills the rest in.
  const media = data?.Media ?? cached.data;

  return {
    manga: toDetail(mediaId, media),
    loading: loading && !media,
    refetching: networkStatus === NetworkStatus.refetch,
  };
}
