import type { LinearWavyProgressIndicatorProps as BaseProps } from "@expo/ui/jetpack-compose";
import { createViewModifierEventListener } from "@expo/ui/jetpack-compose/modifiers";
import { requireNativeView } from "expo";

export type LinearWavyProgressIndicatorProps = Pick<
  BaseProps,
  "progress" | "color" | "trackColor" | "modifiers"
>;

const NativeView = requireNativeView<LinearWavyProgressIndicatorProps>(
  "LinearWavyProgressIndicator",
  "LinearWavyProgressIndicatorView",
);

/**
 * M3's wavy linear progress (`modules/linear-wavy-progress-indicator`):
 * @expo/ui's, which jumps to each new `progress`, animated to it instead.
 */
export function LinearWavyProgressIndicator({
  modifiers,
  ...props
}: LinearWavyProgressIndicatorProps) {
  return (
    <NativeView
      {...props}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
    />
  );
}
