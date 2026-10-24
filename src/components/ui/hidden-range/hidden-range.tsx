import type { ReactNode } from "react";
import { VisuallyHidden } from "react-aria/VisuallyHidden";

// The wrapper shows the ring while the hidden input has keyboard focus.
const RING =
  "rounded-lg has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring has-[input:focus-visible]:ring-offset-4 has-[input:focus-visible]:ring-offset-background";

export interface HiddenRangeProps {
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
  onChange: (value: number) => void;
  children: ReactNode;
}

/**
 * A visually hidden native range input that drives the control it wraps, as
 * react-aria's slider does: PanelUI's slider and rating take no keyboard
 * focus on web, and the browser gives the input arrows, Home/End and Page keys.
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
    <div className={RING}>
      <VisuallyHidden>
        <input
          type="range"
          aria-label={label}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </VisuallyHidden>
      {/* The input is the control screen readers announce; this is its picture. */}
      <div aria-hidden>{children}</div>
    </div>
  );
}
