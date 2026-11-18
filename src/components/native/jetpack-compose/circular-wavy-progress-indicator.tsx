import type { CircularWavyProgressIndicatorProps as BaseProps } from "@expo/ui/jetpack-compose";
import { createViewModifierEventListener } from "@expo/ui/jetpack-compose/modifiers";
import { requireNativeView } from "expo";

export type CircularWavyProgressIndicatorProps = Pick<
  BaseProps,
  "color" | "trackColor" | "waveSpeed" | "modifiers"
> & {
  progress: number;
  /** In dp, for the indicator and its track; M3's 4dp when left out. */
  strokeWidth?: number;
};

const NativeView = requireNativeView<CircularWavyProgressIndicatorProps>(
  "CircularWavyProgressIndicator",
  "CircularWavyProgressIndicatorView",
);

/**
 * M3's wavy ring (`modules/circular-wavy-progress-indicator`): @expo/ui's
 * has no stroke width, which a 20dp ring needs thinner.
 */
export function CircularWavyProgressIndicator({
  modifiers,
  ...props
}: CircularWavyProgressIndicatorProps) {
  return (
    <NativeView
      {...props}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
    />
  );
}
