import type { MangaListQuery } from "../graphql/manga-list.generated";

export function toEntries(data: MangaListQuery | undefined) {
  return (
    data?.MediaListCollection?.lists?.flatMap(
      (list) =>
        list?.entries?.flatMap((entry) => {
          return entry?.media ? entry.media : [];
        }) ?? [],
    ) ?? []
  );
}

export type MangaEntry = ReturnType<typeof toEntries>[number];
