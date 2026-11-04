import type { Chapter } from "./to-chapters";

export type ContinueKind = "continue" | "start" | "pick";

export const CONTINUE_LABEL: Record<ContinueKind, string> = {
  continue: "Continue",
  start: "Start reading",
  pick: "Pick a source",
};

/** `c.N` in our own labels (rows keep the source's title); none when unnumbered. */
export const chapterBadge = (number: number | undefined) =>
  number !== undefined && number >= 0 ? `c.${number}` : undefined;

/** The accessibility label, the chapter spelled out. */
export const continueDescription = (
  action: { chapter?: Chapter },
  label: string,
) =>
  action.chapter && action.chapter.number >= 0
    ? `${label}, chapter ${action.chapter.number}`
    : label;
