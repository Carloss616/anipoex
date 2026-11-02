import { useEffect, useRef } from "react";
import type { View } from "react-native";

/**
 * Marks a pinned sticky header with `data-stuck`, for `stuck:` in global.css:
 * CSS can't tell (Uniwind rejects scroll-state queries). It is set on the DOM,
 * so nothing re-renders. The ref goes on the view whose first child sticks.
 */
export function useStuck(offset: number) {
  const track = useRef<View>(null);

  useEffect(() => {
    const pin = (track.current as unknown as HTMLElement | null)
      ?.firstElementChild;
    if (!pin || !Number.isFinite(offset)) return;
    let root = pin.parentElement;
    while (root && !/auto|scroll/.test(getComputedStyle(root).overflowY)) {
      root = root.parentElement;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        const above =
          entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0);
        pin.toggleAttribute("data-stuck", entry.intersectionRatio < 1 && above);
      },
      // Negate the number, not the text: before the header measures, the
      // offset is negative and `-${…}` would give "--11px".
      { root, rootMargin: `${-(offset + 1)}px 0px 0px 0px`, threshold: 1 },
    );
    observer.observe(pin);
    return () => observer.disconnect();
  }, [offset]);

  return track;
}
