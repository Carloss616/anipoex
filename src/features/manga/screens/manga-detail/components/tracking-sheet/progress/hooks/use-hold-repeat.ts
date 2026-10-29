import { type MouseEvent, type PointerEvent, useEffect, useRef } from "react";

/** Wait before a held button starts repeating, so a tap doesn't trip it. */
const DELAY = 400;
/** Between repeats while held. */
const INTERVAL = 80;

/**
 * Step buttons that repeat while held, as PanelUI's NumberInput did: a press
 * steps once, holding keeps stepping until release. `clamp` bounds each step.
 */
export function useHoldRepeat(
  value: number,
  clamp: (next: number) => number,
  emit: (next: number) => void,
) {
  // Ticks land faster than renders, so each one steps from the last it sent.
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const stop = () => clearTimeout(timer.current);
  useEffect(() => () => clearTimeout(timer.current), []);

  /** Whether it moved; at a bound it didn't, and the repeat stops. */
  const stepBy = (delta: number) => {
    const next = clamp(latest.current + delta);
    if (next === latest.current) return false;
    latest.current = next;
    emit(next);
    return true;
  };

  return (delta: number) => ({
    onPointerDown: (event: PointerEvent) => {
      // A right click opens the context menu; it doesn't step.
      if (event.button !== 0) return;
      stop();
      if (!stepBy(delta)) return;
      const repeat = () => {
        if (stepBy(delta)) timer.current = setTimeout(repeat, INTERVAL);
      };
      timer.current = setTimeout(repeat, DELAY);
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    // A pointer already stepped on pointerdown; only Enter and Space step here.
    onClick: (event: MouseEvent) => {
      if (event.detail === 0) stepBy(delta);
    },
  });
}
