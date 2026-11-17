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

export interface EntryFields {
  progress: number;
  updatedAt?: number;
  createdAt?: number;
  score?: number;
}

export function entryFields(data: MangaListQuery | undefined) {
  const fields: Record<number, EntryFields> = {};
  for (const list of data?.MediaListCollection?.lists ?? []) {
    for (const entry of list?.entries ?? []) {
      if (!entry?.media) continue;
      fields[entry.media.id] = {
        progress: entry.progress ?? 0,
        ...(entry.updatedAt != null && { updatedAt: entry.updatedAt }),
        ...(entry.createdAt != null && { createdAt: entry.createdAt }),
        ...(entry.score && { score: entry.score }),
      };
    }
  }
  return fields;
}
