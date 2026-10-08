import { isValidElement, type ReactNode } from "react";
import type { DimensionValue, ViewStyle } from "react-native";

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
export function dp(value?: DimensionValue | string): number | undefined {
  return typeof value === "number"
    ? value
    : String(value).includes("%")
      ? undefined
      : Number.parseFloat(String(value)) || undefined;
}

/** Left and right padding of a resolved style, in dp, falling back from side to axis to all. */
export function paddingX(s: ViewStyle) {
  const x = dp(s.paddingHorizontal) ?? dp(s.padding) ?? 0;
  return {
    left: dp(s.paddingLeft) ?? dp(s.paddingStart) ?? x,
    right: dp(s.paddingRight) ?? dp(s.paddingEnd) ?? x,
  };
}

/** A Compose `contentPadding` from a resolved style, side over axis over all. */
export function contentPaddingOf(s: ViewStyle) {
  const all = dp(s.padding);
  const x = dp(s.paddingHorizontal) ?? all;
  const y = dp(s.paddingVertical) ?? all;
  return {
    top: dp(s.paddingTop) ?? y,
    bottom: dp(s.paddingBottom) ?? y,
    start: dp(s.paddingStart) ?? dp(s.paddingLeft) ?? x,
    end: dp(s.paddingEnd) ?? dp(s.paddingRight) ?? x,
  };
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
