import type { SourceChapter } from "@/features/extensions";
import { formatDate } from "@/utils/utils";

/** A source chapter as a row: `id` is its url and `number` is -1 when neither the source nor the name gives one. */
export interface Chapter {
  id: string;
  number: number;
  title: string;
  date: string;
  scanlator: string | null;
  memo: string | null;
}

/** "Ch.4", "Chapter 12.5" and "Vol.2 Ch.10" read as 4, 12.5 and 10. */
export function parseChapterNumber(name: string): number {
  const found = name.match(/\bch(?:apter)?\.?\s*(\d+(?:\.\d+)?)/i);
  return found ? Number(found[1]) : -1;
}

export function toChapters(chapters: SourceChapter[]): Chapter[] {
  return chapters.map((chapter) => ({
    id: chapter.url,
    // The source's float32 arrives with noise (10.1 as 10.100000381469727).
    number:
      chapter.number >= 0
        ? Math.round(chapter.number * 1000) / 1000
        : parseChapterNumber(chapter.name),
    title: chapter.name,
    date:
      formatDate(
        chapter.dateUpload ? new Date(chapter.dateUpload) : undefined,
      ) ?? "",
    scanlator: chapter.scanlator,
    memo: chapter.memo,
  }));
}

/** A chapter without a number (-1) is never read; progress 0 reads nothing, else chapters up to it. */
export function isRead(progress: number, number: number): boolean {
  return number >= 0 && progress > 0 && number <= progress;
}
