import type { DimensionValue } from "react-native";

export function resolveSpacing(n: number) {
  return `calc(var(--spacing) * ${n})` as DimensionValue;
}
