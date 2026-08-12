import { skipToken, useFragment, useQuery } from "@apollo/client/react";
import { MangaDocument } from "../graphql/manga.generated";
import { MangaMediaFragmentDoc } from "../graphql/manga-fragments.generated";
import { toEntry } from "../utils/to-entries";

export function useMangaEntry(id: string) {
  const mediaId = Number(id);
  const valid = Number.isInteger(mediaId);

  const cached = useFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: { __typename: "Media", id: mediaId },
  });

  const { data, loading } = useQuery(
    MangaDocument,
    !valid || cached.complete
      ? skipToken
      : {
          variables: { id: mediaId },
          context: { errorMessage: "Couldn't load this manga" },
        },
  );

  const media = cached.complete ? cached.data : data?.Media;

  return { manga: toEntry(mediaId, media), loading: loading && !media };
}
