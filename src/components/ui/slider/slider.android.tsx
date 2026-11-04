import { Slider as ComposeSlider } from "@expo/ui/jetpack-compose";
import { EnsureHost } from "../host";
import type { SliderProps } from "./slider";

/**
 * Compose takes `steps` as the count of stops *between* the ends, not an
 * increment, and reports the raw drag position: hence both maths. It can't
 * name the control for a screen reader, so `label` has nowhere to go.
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/slider/
 */
export function Slider({
  value,
  defaultValue,
  min = 0,
  max = 1,
  step,
  onValueChange,
  disabled = false,
}: SliderProps) {
  const current = value ?? defaultValue ?? min;

  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
      <ComposeSlider
        value={current}
        min={min}
        max={max}
        steps={step}
        enabled={!disabled}
        onValueChange={(next) =>
          onValueChange?.(
            step ? Math.round((next - min) / step) * step + min : next,
          )
        }
      />
    </EnsureHost>
  );
}
