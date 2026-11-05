import type { ExcludedRow, SourceRow } from "./split-sources";

/** One entry of the sheet's flat list; a row knows its place in its section. */
export type SheetItem =
  | { kind: "header"; id: "available" | "excluded" }
  | { kind: "no-sources" }
  | { kind: "available"; row: SourceRow; index: number; count: number }
  | { kind: "excluded"; row: ExcludedRow; index: number; count: number };

export const sheetItemKey = (item: SheetItem) =>
  item.kind === "no-sources"
    ? item.kind
    : `${item.kind}:${item.kind === "header" ? item.id : item.row.source.id}`;

/**
 * Both sections as one list; empty when there is nothing in either, so the
 * sheet shows its empty state instead.
 */
export function sheetItems(
  available: SourceRow[],
  excluded: ExcludedRow[],
): SheetItem[] {
  if (available.length === 0 && excluded.length === 0) return [];
  return [
    { kind: "header", id: "available" },
    ...(available.length === 0 ? [{ kind: "no-sources" } as const] : []),
    ...available.map((row, index) => ({
      kind: "available" as const,
      row,
      index,
      count: available.length,
    })),
    ...(excluded.length > 0
      ? [{ kind: "header", id: "excluded" } as const]
      : []),
    ...excluded.map((row, index) => ({
      kind: "excluded" as const,
      row,
      index,
      count: excluded.length,
    })),
  ];
}
