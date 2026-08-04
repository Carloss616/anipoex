import type { DimensionValue } from "react-native";
import { Uniwind } from "uniwind";

export function resolveSpacing(n: number): DimensionValue {
  const spacing = Uniwind.getCSSVariable("--spacing") ?? 0;

  return Number.isNaN(spacing) ? n : n * Number(spacing);
}
