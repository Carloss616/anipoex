import type { FuzzyDateInput } from "@/graphql/types.generated";

export type PartialFuzzyDate =
  | { year?: number | null; month?: number | null; day?: number | null }
  | null
  | undefined;

/** A partial fuzzy date has no day to point a picker at, so it reads as unset. */
export function fromFuzzyDate(fuzzy: PartialFuzzyDate): Date | undefined {
  if (!fuzzy) return undefined;
  const { year, month, day } = fuzzy;
  if (year == null || month == null || day == null) return undefined;

  return new Date(year, month - 1, day);
}

/** An explicit null triple is what erases a date; an omitted arg is ignored. */
export function toFuzzyDate(date: Date | undefined): FuzzyDateInput {
  if (!date) return { year: null, month: null, day: null };

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}
