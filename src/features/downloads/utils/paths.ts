import { fnv1a } from "@/utils/fnv";

const MAX_NAME = 120;
// biome-ignore lint/suspicious/noControlCharactersInRegex: control chars are the point
const FORBIDDEN = /[/\\:*?"<>|\u0000-\u001f\u007f]/g;

export const chapterHash = (url: string) => fnv1a(url).padStart(8, "0");

export const downloadKey = (mangaId: number, sourceId: string, hash: string) =>
  `${mangaId}/${sourceId}/${hash}`;

export const stageId = (key: string) => key.replaceAll("/", "-");

/** A file or folder name that every platform and cloud accepts. */
export function safeName(name: string, fallback: string) {
  let out = name
    .replace(FORBIDDEN, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/, "");
  if (out.length > MAX_NAME) {
    out = out.slice(0, MAX_NAME);
    const last = out.charCodeAt(out.length - 1);
    if (last >= 0xd800 && last <= 0xdbff) out = out.slice(0, -1);
    out = out.replace(/[. ]+$/, "");
  }
  return out || fallback;
}

export function chapterPath(
  manga: { id: number; title: string },
  source: { id: string; name: string },
  chapter: { url: string; name: string; number: number },
) {
  const fallback =
    chapter.number >= 0 ? `Chapter ${chapter.number}` : "Chapter";
  return [
    "downloads",
    `${safeName(manga.title, "Manga")} [${manga.id}]`,
    `${safeName(source.name, "Source")} [${source.id}]`,
    `${safeName(chapter.name, fallback)} [${chapterHash(chapter.url)}].cbz`,
  ].join("/");
}

/** The content of the last `[...]` in a name. */
export function idOf(name: string) {
  return [...name.matchAll(/\[([^\]]*)\]/g)].at(-1)?.[1];
}

/** 1-based page file name, at least 3 digits. */
export function pageName(index: number, count: number) {
  return String(index + 1).padStart(Math.max(3, String(count).length), "0");
}

export interface StoredDownload {
  hash: string;
  paths: string[];
  local: boolean;
}

/** Files of one source folder, grouped by [hash]: a cloud's conflict copy joins its original. */
export function groupDownloads(
  dir: string,
  files: { name: string; local: boolean }[],
): StoredDownload[] {
  const groups = new Map<string, StoredDownload>();
  for (const { name, local } of files) {
    if (!name.toLowerCase().endsWith(".cbz")) continue;
    const hash = idOf(name);
    if (!hash) continue;
    const group = groups.get(hash) ?? { hash, paths: [], local: true };
    group.paths.push(`${dir}/${name}`);
    group.local &&= local;
    groups.set(hash, group);
  }
  return [...groups.values()];
}
