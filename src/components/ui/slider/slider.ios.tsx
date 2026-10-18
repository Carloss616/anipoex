import { Slider as SwiftUISlider } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  disabled as disabledModifier,
} from "@expo/ui/swift-ui/modifiers";
import type { SliderProps } from "panelui-native/components/slider";
import { EnsureHost } from "../host";

/**
 * iOS Slider: PanelUI's props on a SwiftUI `Slider`, track only. SwiftUI hides
 * the slider's own `label`, so it becomes the accessibility name instead.
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
}: SliderProps) {
  const current = value ?? defaultValue ?? min;

  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
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
    </EnsureHost>
  );
}
