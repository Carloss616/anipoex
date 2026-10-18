import type { DimensionValue } from "react-native";

export function noop() {}

/**
 * Native modifiers take dp, so percentages and `'auto'` — legal in a React
 * Native style — have to be dropped rather than passed through.
 */
export function dp(value?: DimensionValue | string): number | undefined {
  return typeof value === "number"
    ? value
    : String(value).includes("%")
      ? undefined
      : Number.parseFloat(String(value)) || undefined;
}

/** Day, short month and year — "4 Mar 2025". */
export function formatDate(date: Date | undefined, locale?: string) {
  return date?.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
