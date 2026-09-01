import { Slider as SwiftUISlider } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  disabled as disabledModifier,
} from "@expo/ui/swift-ui/modifiers";
import type { SliderProps } from "panelui-native/components/slider";
import { EnsureHost } from "../host";
import { TrackHeader } from "../track-header";

/**
 * iOS Slider: PanelUI's props on a SwiftUI `Slider`. The caption row is ours —
 * SwiftUI hides the slider's own `label`, so it becomes the accessibility name
 * instead. The range props have no SwiftUI equivalent and are ignored.
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/slider/
 */
export function Slider({
  value,
  defaultValue,
  min = 0,
  max = 1,
  step,
  onValueChange,
  disabled: isDisabled = false,
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
          <SwiftUISlider
            value={current}
            min={min}
            max={max}
            step={step}
            onValueChange={onValueChange}
            modifiers={[
              ...(label ? [accessibilityLabel(label)] : []),
              ...(isDisabled ? [disabledModifier(true)] : []),
            ]}
          />
        }
      />
    </EnsureHost>
  );
}
