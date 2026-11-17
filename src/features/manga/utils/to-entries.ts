import type { MangaListQuery } from "../graphql/manga-list.generated";

/**
 * The status groups' media, or with `customList` that custom group's. AniList
 * also returns the custom groups holding a status's entries, which would
 * repeat them.
 */
export function toEntries(
  data: MangaListQuery | undefined,
  customList?: string,
) {
  return (
    data?.MediaListCollection?.lists?.flatMap((list) =>
      !!list?.isCustomList === (customList != null) &&
      (customList == null || list?.name === customList)
        ? (list?.entries?.flatMap((entry) =>
            entry?.media ? entry.media : [],
          ) ?? [])
        : [],
    ) ?? []
  );
}

export type MangaEntry = ReturnType<typeof toEntries>[number];
