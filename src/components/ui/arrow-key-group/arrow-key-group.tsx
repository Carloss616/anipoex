import type { KeyboardEvent, ReactNode } from "react";
import { nextIndex, type Orientation } from "./utils";

export interface ArrowKeyGroupProps {
  orientation: Orientation;
  /** Called with the index the arrows moved focus to, for groups whose choice follows focus. */
  onMove?: (index: number) => void;
  children: ReactNode;
}

const ITEMS = '[tabindex="0"], button:not([disabled])';

/** Web arrow keys, Home and End between the focusable items of a group (tabs, radios, segments). */
export function ArrowKeyGroup({
  orientation,
  onMove,
  children,
}: ArrowKeyGroupProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = [...event.currentTarget.querySelectorAll<HTMLElement>(ITEMS)];
    const current = items.indexOf(document.activeElement as HTMLElement);
    if (current < 0) return;
    const next = nextIndex(current, items.length, event.key, orientation);
    if (next === null) return;
    event.preventDefault();
    items[next].focus();
    onMove?.(next);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: key events bubble up from the items it wraps
    <div onKeyDown={onKeyDown} className="contents">
      {children}
    </div>
  );
}
