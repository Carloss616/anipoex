import type { Observable } from "@legendapp/state";
import { useObservable, useValue } from "@legendapp/state/react";
import { cn } from "panelui-native/utils/cn";
import { type KeyboardEvent, type PointerEvent, useRef } from "react";

/** The row being dragged: where it was, how far it moved, where it lands. */
type Drag = { from: number; to: number; dy: number; height: number };

export type DragList$ = Observable<Drag | null>;

/** One list's drag, shared by its rows: create it in the list, pass it down. */
export const useDragList = (): DragList$ => useObservable<Drag | null>(null);

/** How far row `index` is drawn from its place while another one is dragged. */
function shift(drag$: DragList$, index: number) {
  const drag = drag$.get();
  if (!drag) return 0;
  const { from, to, dy, height } = drag;
  if (index === from) return dy;
  if (from < index && index <= to) return -height;
  if (to <= index && index < from) return height;
  return 0;
}

/**
 * A web list row that moves by dragging its handle, or by ↑ and ↓ on it.
 * Spread `row` on the row's view and `handle` on its handle button.
 */
export function useDragReorder({
  drag$,
  index,
  count,
  label,
  onMove,
}: {
  /** The list's, from `useDragList`. */
  drag$: DragList$;
  index: number;
  count: number;
  /** The handle's accessible name. */
  label: string;
  onMove: (to: number) => void;
}) {
  const offset = useValue(() => shift(drag$, index));
  const dragging = useValue(() => drag$.get()?.from === index);
  // Only while a drag runs: at the drop, the rows jump to their new places.
  const sliding = useValue(() => drag$.get() != null) && !dragging;
  const handle = useRef<HTMLButtonElement>(null);
  const start = useRef(0);

  const move = (to: number) => {
    onMove(to);
    // Keyed by id, the row keeps its node; moving it in the DOM drops focus.
    requestAnimationFrame(() => handle.current?.focus());
  };

  const onPointerEnd = () => {
    const drag = drag$.peek();
    if (drag?.from !== index) return;
    drag$.set(null);
    if (drag.to !== index) move(drag.to);
  };

  return {
    row: {
      "data-row": true,
      style: {
        transform: [{ translateY: offset }],
        zIndex: dragging ? 1 : 0,
      },
      className: cn(
        dragging && "bg-card shadow-lg",
        sliding && "transition-transform duration-150",
      ),
    },
    handle: {
      ref: handle,
      "aria-label": label,
      className: "cursor-grab touch-none active:cursor-grabbing",
      onKeyDown: (event: KeyboardEvent) => {
        const step = { ArrowUp: -1, ArrowDown: 1 }[event.key];
        if (!step) return;
        event.preventDefault();
        const to = index + step;
        if (to >= 0 && to < count) move(to);
      },
      onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
        const row = event.currentTarget.closest<HTMLElement>("[data-row]");
        if (!row) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        start.current = event.clientY;
        drag$.set({ from: index, to: index, dy: 0, height: row.offsetHeight });
      },
      onPointerMove: (event: PointerEvent) => {
        const drag = drag$.peek();
        if (drag?.from !== index) return;
        const dy = event.clientY - start.current;
        const to = Math.max(
          0,
          Math.min(count - 1, index + Math.round(dy / drag.height)),
        );
        drag$.set({ ...drag, dy, to });
      },
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
    },
  };
}
