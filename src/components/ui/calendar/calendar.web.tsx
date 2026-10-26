import {
  type CalendarMode,
  type CalendarProps,
  Calendar as PanelCalendar,
} from "panelui-native/components/calendar";
import { cn } from "panelui-native/utils/cn";
import type { KeyboardEvent } from "react";
import { nextGridIndex, nextIndex } from "../arrow-key-group/utils";

export * from "panelui-native/components/calendar";

// Every cell of every week, spacers included, so the columns stay seven wide.
const CELLS = '[role="list"] > :not(:first-child) > *';
const DAY = '[role="button"]:not(:disabled)';
// Past a disabled day or a spacer, Home and End keep going inward.
const ONWARD: Record<string, string> = { Home: "ArrowRight", End: "ArrowLeft" };
// The open month or year menu's backdrop, and its checked option.
const BACKDROP = '[aria-label="Close"]';
const PICKED_OPTION = `${BACKDROP} ~ * [role="button"]:has(svg)`;

/** PanelUI's Calendar with hover, and arrow keys in its grid and menus. */
export function Calendar<Mode extends CalendarMode = "single">({
  className,
  ...props
}: CalendarProps<Mode>) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    // PanelUI leaves focus on the chip that opened the menu.
    const picked = document.querySelector<HTMLElement>(PICKED_OPTION);
    if (
      event.key === "ArrowDown" &&
      picked?.parentElement &&
      !target.closest('[role="list"]')
    ) {
      event.preventDefault();
      const sheet = target.closest<HTMLElement>('[role="dialog"]');
      // PanelUI's portal moves the options out of this tree, React's included.
      picked.parentElement.onkeydown = (key) => moveInMenu(key, sheet, target);
      // The menu scrolls and clips its options: their ring goes inside.
      for (const option of picked.parentElement.children)
        (option as HTMLElement).dataset.ring = "inset";
      focusPastTrap(picked, sheet);
      return;
    }

    const cells = [...event.currentTarget.querySelectorAll<HTMLElement>(CELLS)];
    const current = cells.indexOf(target);
    if (current < 0) return;
    const onward = ONWARD[event.key] ?? event.key;
    let next = nextGridIndex(current, cells.length, event.key, 7);
    while (next !== null && !cells[next].matches(DAY))
      next = nextGridIndex(next, cells.length, onward, 7);
    if (next === null) return;
    event.preventDefault();
    cells[next].focus();
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: key events bubble up from its days
    <div onKeyDown={onKeyDown} className="contents">
      <PanelCalendar
        {...props}
        className={cn(
          // PanelUI's buttons take no class; a day lights its disc, not a picked one.
          "[&_[role=button]:not([role=list]_*)]:transition-colors",
          "[&_[role=button]:not([role=list]_*)]:hover:bg-secondary/90",
          "[&_[role=button]:not([role=list]_*)]:active:bg-accent",
          "[&_[role=list]_[role=button]>:last-child]:transition-colors",
          "[&_[role=list]_[role=button]:hover:not(:active)>:last-child:not(.bg-primary)]:bg-secondary/90",
          "[&_[role=list]_[role=button]:active>:last-child:not(.bg-primary)]:bg-accent",
          className,
        )}
      />
    </div>
  );
}

function moveInMenu(
  event: globalThis.KeyboardEvent,
  sheet: HTMLElement | null,
  chip: HTMLElement,
) {
  if (event.key === "Escape") {
    // Before the sheet's OverlayScope, which would close the whole sheet.
    event.stopPropagation();
    document.querySelector<HTMLElement>(BACKDROP)?.click();
    chip.focus();
    return;
  }
  const option = event.target as HTMLElement;
  const options = [...(option.parentElement?.children ?? [])] as HTMLElement[];
  const next = nextIndex(
    options.indexOf(option),
    options.length,
    event.key,
    "vertical",
  );
  if (next === null) return;
  event.preventDefault();
  focusPastTrap(options[next], sheet);
}

// Inert, a sheet's Radix focus trap can't pull focus back out of PanelUI's portal.
function focusPastTrap(element: HTMLElement, sheet: HTMLElement | null) {
  if (sheet) sheet.inert = true;
  element.focus();
  if (sheet) sheet.inert = false;
}
