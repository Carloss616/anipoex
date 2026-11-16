import { groupDownloads, idOf, type StoredDownload } from "../../paths";

export interface TreeFile {
  path: string;
  placeholder: boolean;
}

/** The downloads of one manga and source in a flat `downloads/<manga>/<source>/<file>` listing. */
export function treeDownloads(
  tree: TreeFile[],
  mangaId: number,
  sourceId: string,
): StoredDownload[] {
  const rows = tree
    .map((file) => ({ file, parts: file.path.split("/") }))
    .filter(({ parts }) => parts.length === 4);
  const manga = rows.find(({ parts }) => idOf(parts[1]) === String(mangaId))
    ?.parts[1];
  const source = rows.find(
    ({ parts }) => parts[1] === manga && idOf(parts[2]) === sourceId,
  )?.parts[2];
  if (!manga || !source) return [];
  return groupDownloads(
    `downloads/${manga}/${source}`,
    rows
      .filter(({ parts }) => parts[1] === manga && parts[2] === source)
      .map(({ file, parts }) => ({
        name: parts[3],
        local: !file.placeholder,
      })),
  );
}
