import {
  fillMaxHeight,
  fillMaxWidth,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { StyleSheet } from "react-native";
import type { StyleModifiers } from "./resolve-fill";

/**
 * @see [the iOS twin](./resolve-fill.ios.ts) for why `"100%"` and `flex` can't
 * reach @expo/ui. Compose has a real proportional answer for `flex`, so this side
 * hands it the weight and lets the enclosing stack pick the axis; outside a stack
 * the modifier falls back to a no-op on its own.
 */
export function resolveFill({
  style,
  modifiers,
}: StyleModifiers): StyleModifiers {
  const flat: Record<string, unknown> = {
    ...(StyleSheet.flatten(style) ?? {}),
  };
  const fills = [];

  if (typeof flat.flex === "number" && flat.flex > 0) {
    fills.push(weight(flat.flex));
    delete flat.flex;
  }
  if (flat.width === "100%") {
    delete flat.width;
    fills.push(fillMaxWidth());
  }
  if (flat.height === "100%") {
    delete flat.height;
    fills.push(fillMaxHeight());
  }

  if (!fills.length) return { style, modifiers };
  return { style: flat, modifiers: [...fills, ...(modifiers ?? [])] };
}
