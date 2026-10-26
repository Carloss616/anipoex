import type { KeyboardEvent } from "react";
import type { ArrowKeyGroupProps } from "./arrow-key-group";
import { nextGridIndex, nextIndex } from "./utils";

const ITEMS = '[tabindex="0"], button:not([disabled])';
const GROUP = "[data-arrow-key-group]";
// A cell scrolled in renders a few frames later; give up after about half a second.
const MAX_FRAMES = 30;
// Past an empty first or last cell, Home and End keep going inward.
const ONWARD: Record<string, string> = { Home: "ArrowRight", End: "ArrowLeft" };

/** Web arrow keys, Home and End between a group's items: tabs, radios, segments, grids. */
export function ArrowKeyGroup(props: ArrowKeyGroupProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) return;
    const group = event.currentTarget;

    if (props.orientation === "grid") {
      const active = document.activeElement as HTMLElement | null;
      // Only from a cell's own item: a text field in a cell keeps its arrows.
      if (!active?.matches(ITEMS)) return;
      const cell = cellOf(group, active);
      if (!cell) return;
      const { count, columns } = props;
      const items = itemsOf(group, cell);
      const position = items.indexOf(active);

      // In a one-column list, left and right go between a row's own buttons.
      if (
        columns === 1 &&
        (event.key === "ArrowLeft" || event.key === "ArrowRight")
      ) {
        const item = items[position + (event.key === "ArrowRight" ? 1 : -1)];
        if (position < 0 || !item) return;
        event.preventDefault();
        item.focus();
        return;
      }

      let next = nextGridIndex(
        Number(cell.dataset.index),
        count,
        event.key,
        columns,
      );
      // Step over cells with nothing to focus, like section headers.
      const onward = ONWARD[event.key] ?? event.key;
      while (next !== null && isEmptyCell(group, next))
        next = nextGridIndex(next, count, onward, columns);
      if (next === null) return;
      event.preventDefault();
      focusCell(group, next, Math.max(position, 0), props.scrollToIndex);
      props.onMove?.(next);
      return;
    }

    const items = [...group.querySelectorAll<HTMLElement>(ITEMS)];
    const current = items.indexOf(document.activeElement as HTMLElement);
    if (current < 0) return;
    const next = nextIndex(current, items.length, event.key, props.orientation);
    if (next === null) return;
    event.preventDefault();
    items[next].focus();
    props.onMove?.(next);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: key events bubble up from the items it wraps
    <div onKeyDown={onKeyDown} className="contents" data-arrow-key-group>
      {props.children}
    </div>
  );
}

/** The group's own cell at `index`: a list nested in a cell numbers its cells too. */
function cellAt(group: HTMLElement, index: number) {
  return [
    ...group.querySelectorAll<HTMLElement>(`[data-index="${index}"]`),
  ].find((cell) => cell.closest(GROUP) === group);
}

/** The group's own cell holding `node`, past the cells of a list nested in it. */
function cellOf(group: HTMLElement, node: HTMLElement) {
  let cell = node.closest<HTMLElement>("[data-index]");
  while (cell && cell.closest(GROUP) !== group)
    cell = cell.parentElement?.closest<HTMLElement>("[data-index]") ?? null;
  return cell;
}

/** A cell's own focusable items, without those of a list nested in it. */
function itemsOf(group: HTMLElement, cell: HTMLElement) {
  return [...cell.querySelectorAll<HTMLElement>(ITEMS)].filter(
    (item) => item.closest(GROUP) === group,
  );
}

function isEmptyCell(group: HTMLElement, index: number) {
  const cell = cellAt(group, index);
  return cell !== undefined && itemsOf(group, cell).length === 0;
}

/** Focuses the item at `position` in the cell (or its last), scrolling an unrendered cell in. */
function focusCell(
  group: HTMLElement,
  index: number,
  position: number,
  scrollToIndex: (index: number) => void,
) {
  const find = () => {
    const cell = cellAt(group, index);
    const items = cell ? itemsOf(group, cell) : [];
    return items[Math.min(position, items.length - 1)];
  };
  const item = find();
  if (item) return item.focus();

  scrollToIndex(index);
  let frames = 0;
  const retry = () => {
    const found = find();
    if (found) found.focus();
    else if (++frames < MAX_FRAMES) requestAnimationFrame(retry);
  };
  requestAnimationFrame(retry);
}
