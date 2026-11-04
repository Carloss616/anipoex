import type { HTMLAttributes } from "react";
import type {
  MenuAction,
  MenuGroup,
  MenuItem,
  MenuProps,
  MenuSelection,
  MenuSubmenu,
} from "./menu";

export const isSubmenu = (item: MenuItem): item is MenuSubmenu =>
  "items" in item && "label" in item;

export const isGroup = (item: MenuItem): item is MenuGroup =>
  "items" in item && !("label" in item);

/** A run of rows for a menu drawn as segments (Compose's Expressive menu). */
export interface MenuSegment {
  heading?: string;
  items: MenuAction[];
  /** A submenu's own selection; the menu's when left out. */
  selection?: MenuSelection;
}

/**
 * For a menu without submenus (Compose's): plain rows in a row share a
 * segment, a group is its own under its heading, and a submenu becomes one
 * headed by its label, its disabled state passed to each row.
 */
export const toSegments = (items: MenuItem[]): MenuSegment[] => {
  const segments: MenuSegment[] = [];
  // The segment plain rows join; a group or submenu ends it.
  let run: MenuSegment | undefined;
  for (const item of items) {
    if (isGroup(item)) {
      run = undefined;
      segments.push({ heading: item.heading, items: item.items });
    } else if (isSubmenu(item)) {
      run = undefined;
      segments.push({
        heading: item.label,
        selection: item.selection,
        items: item.items.map((row) => ({
          ...row,
          disabled: item.disabled || row.disabled,
        })),
      });
    } else if (run) {
      run.items.push(item);
    } else {
      run = { items: [item] };
      segments.push(run);
    }
  }
  return segments;
};

type Handler = ((event: never) => void) | undefined;

/** A react-native pressable trigger is passed with an `onPress` prop. */
export const isPressable = (child: MenuProps["children"]) =>
  "onPress" in child.props;

/**
 * Click and right-click as a pressable's press and long press, after its own.
 * @platform web
 */
export function asPress(
  props: HTMLAttributes<Element>,
  child: MenuProps["children"],
) {
  const both = (own: Handler, menu: Handler) => (event: never) => {
    own?.(event);
    menu?.(event);
  };
  return {
    ...props,
    onPress: both(child.props.onPress, props.onClick),
    onLongPress: both(child.props.onLongPress, props.onContextMenu),
  };
}
