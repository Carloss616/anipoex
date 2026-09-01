import { isValidElement, type ReactNode } from "react";
import type { AnimatableNumericValue, DimensionValue } from "react-native";

export function noop() {}

/** Drop `undefined` entries so the object can spread over defaults without erasing them. */
export function omitUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>;
}

/**
 * Native modifiers take dp, so percentages and `'auto'` — legal in a React
 * Native style — have to be dropped rather than passed through.
 */
export function dp(
  value?: DimensionValue | AnimatableNumericValue | string,
): number | undefined {
  return typeof value === "number"
    ? value
    : String(value).includes("%")
      ? undefined
      : Number.parseFloat(String(value)) || undefined;
}

/** Extract plain text from a child's tree. */
export function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node))
    return textOf(node.props.children);
  return "";
}

/** Day, short month and year — "4 Mar 2025". */
export function formatDate(date: Date | undefined, locale?: string) {
  return date?.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
