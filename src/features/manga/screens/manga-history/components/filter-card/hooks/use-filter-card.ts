import { useFragment } from "@apollo/client/react";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { libraryDetail } from "../../../utils/library-detail";

/** The filtered manga's title, cover and progress, from the cache. */
export function useFilterCard(mediaId: number) {
  const { data } = useFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: { __typename: "Media", id: mediaId },
  });
  return {
    title: data?.title?.userPreferred ?? `Manga ${mediaId}`,
    cover: data?.coverImage,
    detail: libraryDetail(data ?? {}),
  };
}
