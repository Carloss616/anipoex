import { createModifier } from "@expo/ui/jetpack-compose/modifiers";

/** SwiftUI's unit point: 0–1 of the width and height. */
interface UnitPoint {
  x: number;
  y: number;
}

export interface LinearGradientOptions {
  colors: string[];
  /** One per color, 0–1 ascending; evenly spread when left out. */
  locations?: number[];
  /** Default top center. */
  startPoint?: UnitPoint;
  /** Default bottom center. */
  endPoint?: UnitPoint;
}

/**
 * A gradient behind any Compose component, registered by the local
 * `modules/modifiers`. Takes `ramp()`'s stops as they come. Inside a
 * Host it's drawn by Compose, where an RN `LinearGradient` needs an
 * `RNHostView`.
 */
export const linearGradient = (options: LinearGradientOptions) =>
  createModifier("linearGradient", { ...options });
