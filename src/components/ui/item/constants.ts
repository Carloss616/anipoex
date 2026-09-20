import type { ItemMediaProps, ItemProps } from "panelui-native/components/item";
import type { TypographyType } from "panelui-native/components/typography";
import { createContext, useContext } from "react";

export type ItemSize = NonNullable<ItemProps["size"]>;
type ItemMediaVariant = NonNullable<ItemMediaProps["variant"]>;

/** Row padding and the gap between its slots — the web row's own values. */
export const PADDINGS = {
  default: "gap-3 p-4",
  sm: "gap-3 p-3",
  xs: "gap-2 p-2",
} as const satisfies Record<ItemSize, string>;

/** `text-base` / `text-sm` / `text-sm`, as the nearest Typography preset. */
export const TITLE_TYPES = {
  default: "body",
  sm: "body-sm",
  xs: "body-sm",
} as const satisfies Record<ItemSize, TypographyType>;

export const DESCRIPTION_TYPES = {
  default: "body-sm",
  sm: "body-xs",
  xs: "body-xs",
} as const satisfies Record<ItemSize, TypographyType>;

/** Leading tile, sized off the row's density. `default` is whatever it holds. */
export const MEDIA_SIZES = {
  default: { default: "", sm: "", xs: "" },
  icon: { default: "h-10 w-10", sm: "h-8 w-8", xs: "h-6 w-6" },
  image: { default: "h-12 w-12", sm: "h-10 w-10", xs: "h-8 w-8" },
} as const satisfies Record<ItemMediaVariant, Record<ItemSize, string>>;

/** The row's density, so each slot inherits it instead of being told. */
export const ItemSizeContext = createContext<ItemSize>("default");

export function useItemSize() {
  return useContext(ItemSizeContext);
}
