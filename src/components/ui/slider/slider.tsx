import {
  Slider as PanelSlider,
  type SliderProps,
} from "panelui-native/components/slider";
import { HiddenRange } from "../hidden-range";

export * from "panelui-native/components/slider";

/** PanelUI's Slider with a hidden range input, so the keyboard can adjust it on web. */
export function Slider({
  accessibilityLabel,
  ...props
}: SliderProps & {
  /** Names the control for screen readers, without the visible `label`. @platform web */
  accessibilityLabel?: string;
}) {
  const { value, onValueChange, min = 0, max = 100, step = 1 } = props;
  if (value === undefined || !onValueChange) return <PanelSlider {...props} />;

  return (
    <HiddenRange
      value={value}
      min={min}
      max={max}
      step={step}
      label={accessibilityLabel ?? props.label ?? ""}
      onChange={onValueChange}
    >
      <PanelSlider {...props} />
    </HiddenRange>
  );
}
