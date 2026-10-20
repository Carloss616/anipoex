import type { ExcludedRow, SourceRow } from "./split-sources";

/** One entry of the sheet's flat list: a section header or a source row; `first` rows draw no divider above. */
export type SheetItem =
  | { kind: "header"; id: "available" | "no-sources" | "excluded" }
  | { kind: "available"; row: SourceRow; first: boolean }
  | { kind: "excluded"; row: ExcludedRow; first: boolean };

export const sheetItemKey = (item: SheetItem) =>
  `${item.kind}:${item.kind === "header" ? item.id : item.row.source.id}`;

/** Both sections as one list; empty when there is nothing in either, so the sheet shows its empty state instead. */
export function sheetItems(
  available: SourceRow[],
  excluded: ExcludedRow[],
): SheetItem[] {
  if (available.length === 0 && excluded.length === 0) return [];
  return [
    { kind: "header", id: "available" },
    ...(available.length === 0
      ? [{ kind: "header", id: "no-sources" } as const]
      : []),
    ...available.map((row, i) => ({
      kind: "available" as const,
      row,
      first: i === 0,
    })),
    ...(excluded.length > 0
      ? [{ kind: "header", id: "excluded" } as const]
      : []),
    ...excluded.map((row, i) => ({
      kind: "excluded" as const,
      row,
      first: i === 0,
    })),
  ];
}
