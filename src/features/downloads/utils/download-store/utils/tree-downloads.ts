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

/**
 * `path` moved into the manga and source folders of `tree` with the same
 * [id]s, the ones treeDownloads lists: a renamed folder keeps its chapters.
 */
export function intoExisting(tree: TreeFile[], path: string) {
  const parts = path.split("/");
  const rows = tree.map((file) => file.path.split("/"));
  for (const at of [1, 2]) {
    if (at >= parts.length - 1) break;
    const found = rows.find(
      (row) =>
        row.length > at + 1 &&
        row.slice(0, at).every((part, i) => part === parts[i]) &&
        idOf(row[at]) === idOf(parts[at]),
    );
    if (found) parts[at] = found[at];
  }
  return parts.join("/");
}
