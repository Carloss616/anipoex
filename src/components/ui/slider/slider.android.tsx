import { Slider as ComposeSlider } from "@expo/ui/jetpack-compose";
import type { SliderProps } from "panelui-native/components/slider";
import { EnsureHost } from "../host";
import { TrackHeader } from "../track-header";

/**
 * Android Slider: Compose takes `steps` as the count of stops *between* the
 * ends, not an increment, and reports the raw drag position — hence both maths.
 * The caption row is ours; Compose exposes no way to name the control for a
 * screen reader, so `label` only ever shows there.
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
  label,
  showValue = false,
  formatValue,
  headerClassName,
}: SliderProps) {
  const current = value ?? defaultValue ?? min;

  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
      <TrackHeader
        label={label}
        headerClassName={headerClassName}
        valueLabel={
          showValue
            ? (formatValue?.(current) ?? String(Math.round(current)))
            : undefined
        }
        track={
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
        }
      />
    </EnsureHost>
  );
}
