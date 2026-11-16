import { type Chapter, isRead } from "@/features/manga/utils/to-chapters";
import { chapterHash } from "./paths";

export type DownloadPick = "next" | "next5" | "next10" | "unread" | "all";

const COUNT: Record<DownloadPick, number> = {
  next: 1,
  next5: 5,
  next10: 10,
  unread: Infinity,
  all: Infinity,
};

/**
 * Newest-first chapters → oldest-first picks: one row per number, none
 * already downloaded.
 */
export function pickChapters(
  chapters: Chapter[],
  pick: DownloadPick,
  progress: number,
  downloadedHashes: Set<string>,
  preferScanlator: string | null,
): Chapter[] {
  // An unnumbered chapter is its own group, keyed by id.
  const groups = new Map<string | number, Chapter[]>();
  for (const c of chapters) {
    const key = c.number < 0 ? c.id : c.number;
    const group = groups.get(key);
    if (group) group.push(c);
    else groups.set(key, [c]);
  }

  const picked: Chapter[] = [];
  for (const group of groups.values()) {
    if (group.some((c) => downloadedHashes.has(chapterHash(c.id)))) continue;
    if (pick !== "all" && !(group[0].number >= 0 && group[0].number > progress))
      continue;
    picked.push(
      group.find((c) => preferScanlator && c.scanlator === preferScanlator) ??
        group[0],
    );
  }

  const known = picked
    .filter((c) => c.number >= 0)
    .sort((a, b) => a.number - b.number);
  const unknown = picked.filter((c) => c.number < 0).reverse();
  return [...known, ...unknown].slice(0, COUNT[pick]);
}

/**
 * The scanlator of the highest-numbered chapter read (≤ progress) or
 * downloaded; null if none.
 */
export function preferredScanlator(
  chapters: Chapter[],
  progress: number,
  downloadedHashes: Set<string>,
): string | null {
  let best: Chapter | null = null;
  for (const c of chapters) {
    if (c.number < 0) continue;
    const used =
      isRead(progress, c.number) || downloadedHashes.has(chapterHash(c.id));
    if (used && (!best || c.number > best.number)) best = c;
  }
  return best?.scanlator ?? null;
}
