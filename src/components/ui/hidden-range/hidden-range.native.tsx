import type { HiddenRangeProps } from "./hidden-range";

/** Native sliders and ratings take the platform's own adjust actions. */
export function HiddenRange({ children }: HiddenRangeProps) {
  return <>{children}</>;
}
