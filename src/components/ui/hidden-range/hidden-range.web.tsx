import { View } from "react-native";
import type { HiddenRangeProps } from "./hidden-range";

// The wrapper shows the ring while the hidden input has keyboard focus.
const RING =
  "rounded-lg has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring has-[input:focus-visible]:ring-offset-4 has-[input:focus-visible]:ring-offset-background";

/**
 * A visually hidden native range input that drives the control it wraps, as
 * an accessible slider does: PanelUI's rating takes no keyboard focus on web,
 * and the browser gives the input arrows, Home/End and Page keys.
 */
export function HiddenRange({
  value,
  min,
  max,
  step,
  label,
  onChange,
  children,
}: HiddenRangeProps) {
  return (
    <View className={RING}>
      <input
        type="range"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="sr-only"
      />
      {/* Screen readers announce the input; this is only its picture. */}
      <View aria-hidden>{children}</View>
    </View>
  );
}
