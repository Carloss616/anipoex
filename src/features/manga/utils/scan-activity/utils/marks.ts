import type { ProviderProbe } from "../../msu";
import type { Source } from "../../source";
import { unreadChapters } from "../../source-classify";

export type MarkState = "pending" | "scanning" | "found" | "nomatch" | "error";

export interface SourceMark
  extends Pick<Source, "id" | "name" | "initials" | "iconUrl"> {
  state: MarkState;
  /** found only */
  unread?: number;
}

export const VISIBLE_MARKS = 6;

const RANK: Record<MarkState, number> = {
  found: 0,
  scanning: 1,
  pending: 2,
  error: 3,
  nomatch: 4,
};

export function markOf(
  probe: ProviderProbe,
  read: number,
): Pick<SourceMark, "state" | "unread"> {
  if (probe.errored) return { state: "error" };
  if (!probe.matched) return { state: "nomatch" };
  return { state: "found", unread: unreadChapters(read, probe.latest) };
}

export function orderMarks(marks: SourceMark[]): SourceMark[] {
  return [...marks].sort(
    (a, b) =>
      RANK[a.state] - RANK[b.state] || (b.unread ?? 0) - (a.unread ?? 0),
  );
}

export function visibleMarks(marks: SourceMark[], max = VISIBLE_MARKS) {
  return { shown: marks.slice(0, max), more: Math.max(0, marks.length - max) };
}

export const marksById = (marks: SourceMark[]) =>
  Object.fromEntries(marks.map((m) => [m.id, m]));

/** Writes a source's new state over its mark, keeping its name and icon. */
export function setMark(
  marks: Record<string, SourceMark>,
  id: string,
  mark: Pick<SourceMark, "state" | "unread">,
) {
  const current = marks[id];
  if (current) marks[id] = { ...current, ...mark };
}
