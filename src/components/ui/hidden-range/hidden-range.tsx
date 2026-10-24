import { type ReactNode, useState } from "react";
import { VisuallyHidden } from "react-aria/VisuallyHidden";

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
  const [ring, setRing] = useState(false);

  return (
    <div
      style={{
        borderRadius: 8,
        outline: ring ? "2px solid var(--color-ring)" : undefined,
        outlineOffset: 4,
      }}
    >
      <VisuallyHidden>
        <input
          type="range"
          aria-label={label}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          onFocus={(event) => setRing(event.target.matches(":focus-visible"))}
          onBlur={() => setRing(false)}
        />
      </VisuallyHidden>
      {/* The input is the control screen readers announce; this is its picture. */}
      <div aria-hidden>{children}</div>
    </div>
  );
}
