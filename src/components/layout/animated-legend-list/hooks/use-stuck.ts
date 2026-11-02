import { useEffect, useRef } from "react";
import type { View } from "react-native";

const noop = () => {};

/**
 * Marks a pinned sticky header with `data-stuck`, for `stuck:` in global.css:
 * CSS can't tell (Uniwind rejects scroll-state queries). It is set on the DOM,
 * so nothing re-renders. The ref goes on the view whose first child sticks.
 */
export function useStuck() {
  const track = useRef<View>(null);
  const update = useRef(noop);

  useEffect(() => {
    const trackEl = track.current as unknown as HTMLElement | null;
    const pin = trackEl?.firstElementChild;
    if (!trackEl || !pin) return;
    let root = trackEl.parentElement;
    while (root && !/auto|scroll/.test(getComputedStyle(root).overflowY)) {
      root = root.parentElement;
    }
    const scroller = root ?? window;
    let frame = 0;
    // Pinned means moved off its place in the track. Not an observer: a header
    // resting on its pin line (the first item, offset 0) looks pinned to one.
    update.current = () => {
      frame = 0;
      const moved =
        pin.getBoundingClientRect().top - trackEl.getBoundingClientRect().top;
      pin.toggleAttribute("data-stuck", moved > 0.5);
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update.current);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      update.current = noop;
    };
  }, []);

  // The list moves the track with no scroll event (a jump, a recycled cell).
  useEffect(() => update.current());

  return track;
}
