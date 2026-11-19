/** A manga's place in your list: "Chapter 120", "Not started", "Not in your list". */
export function libraryDetail(manga: {
  mediaListEntry?: { progress?: number | null } | null;
}) {
  const entry = manga.mediaListEntry;
  if (!entry) return "Not in your list";
  return entry.progress ? `Chapter ${entry.progress}` : "Not started";
}
