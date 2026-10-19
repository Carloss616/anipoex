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

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

// shortcut: the device locale is read once per run, reload the JS if it changes mid-session.
const dateFormats = new Map<string | undefined, Intl.DateTimeFormat>();

/** Day, short month and year — "4 Mar 2025"; one formatter per locale, since Hermes builds one per `toLocaleDateString`. */
export function formatDate(date: Date | undefined, locale?: string) {
  // An invalid date reads "Invalid Date" here, where `format` would throw.
  if (!date || Number.isNaN(date.getTime()))
    return date?.toLocaleDateString(locale, DATE_FORMAT);
  let format = dateFormats.get(locale);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, DATE_FORMAT);
    dateFormats.set(locale, format);
  }
  return format.format(date);
}
