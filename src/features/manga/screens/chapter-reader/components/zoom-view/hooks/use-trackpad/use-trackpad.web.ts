import { type RefObject, useEffect, useEffectEvent } from "react";
import type { TrackpadHandlers } from "./use-trackpad";

// A pinch is over once its wheel events stop this long.
const END_DELAY = 150;
// A mouse wheel notch with ctrl is ~100; capped so it zooms by ~1.3x, as a pinch step would.
const MAX_DELTA = 25;

/** Browsers (and Electron) send a trackpad pinch as wheel events with `ctrlKey`, deltaY = -100 × ln(scale). */
export function useTrackpad(
  ref: RefObject<unknown>,
  handlers: TrackpadHandlers,
) {
  const onPinchStart = useEffectEvent((x: number, y: number) =>
    handlers.onPinchStart(x, y),
  );
  const onPinch = useEffectEvent((factor: number) => handlers.onPinch(factor));
  const onPinchEnd = useEffectEvent(() => handlers.onPinchEnd());
  const onScroll = useEffectEvent((dx: number, dy: number) =>
    handlers.onScroll(dx, dy),
  );

  useEffect(() => {
    const node = ref.current as HTMLElement | null;
    if (!node) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let factor = 1;

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) {
        if (onScroll(event.deltaX, event.deltaY)) event.preventDefault();
        return;
      }
      // Otherwise the browser zooms the whole page.
      event.preventDefault();
      if (timer === undefined) {
        const rect = node.getBoundingClientRect();
        factor = 1;
        onPinchStart(event.clientX - rect.left, event.clientY - rect.top);
      } else clearTimeout(timer);
      const delta = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, event.deltaY));
      factor *= Math.exp(-delta / 100);
      onPinch(factor);
      timer = setTimeout(() => {
        timer = undefined;
        onPinchEnd();
      }, END_DELAY);
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      node.removeEventListener("wheel", onWheel);
      clearTimeout(timer);
    };
  }, [ref]);
}
