import type { QueuedDownload } from "../state/download-queue";

const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

const tag = (name: string, value: string | number) =>
  `  <${name}>${String(value).replace(/[&<>"']/g, (c) => ENTITIES[c])}</${name}>`;

/** The chapter's `ComicInfo.xml`, as Mihon writes it into a CBZ. */
export function comicInfo({ manga, chapter }: QueuedDownload) {
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    "<ComicInfo>",
    tag("Series", manga.title),
    chapter.number >= 0 && tag("Number", chapter.number),
    tag("Title", chapter.name),
    chapter.scanlator !== null && tag("ScanInformation", chapter.scanlator),
    tag("Web", chapter.url),
    "</ComicInfo>",
  ]
    .filter(Boolean)
    .join("\n");
}
