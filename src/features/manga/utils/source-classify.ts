import type { AutoBadKind, ResultKind } from "./msu";

/** Whole chapters still unread: a .5 release isn't one, so the gap is floored. */
export function unreadChapters(read: number, latest: number): number {
  return Math.max(0, Math.floor(latest - read));
}

export function classify(
  read: number,
  latest: number,
  count: number,
  errored: boolean,
  gap: number,
): ResultKind {
  if (errored) return "error-found";
  if (count === 0) return "not-matched";
  if (read > 0 && read - latest >= gap) return "outdated";
  return unreadChapters(read, latest) > 0 ? "new" : "up-to-date";
}

export function isBadKind(kind: ResultKind): kind is AutoBadKind {
  return (
    kind === "not-matched" || kind === "error-found" || kind === "outdated"
  );
}
