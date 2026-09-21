import type { ItemMediaProps, ItemProps } from "panelui-native/components/item";
import type { TypographyType } from "panelui-native/components/typography";
import { createContext, useContext } from "react";
import { StyleSheet } from "react-native";
import { useCSSVariable } from "uniwind";
import { useThemeColor } from "@/hooks/use-theme-color";
import { dp } from "@/utils/utils";

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

/** Tile side in dp — the web tile's `h-10 w-10` and friends. */
export const MEDIA_SIDES = {
  icon: { default: 40, sm: 32, xs: 24 },
  image: { default: 48, sm: 40, xs: 32 },
} as const satisfies Record<
  Exclude<ItemMediaVariant, "default">,
  Record<ItemSize, number>
>;

/** The row's density, so each slot inherits it instead of being told. */
export const ItemSizeContext = createContext<ItemSize>("default");

export function useItemSize() {
  return useContext(ItemSizeContext);
}

/**
 * A boxed media tile, resolved to values. The native stacks translate only a
 * handful of classes — rounding and borders don't survive — so the tile is
 * drawn with modifiers, and the one class it still honors is a `bg-*` fill.
 * `null` for the `default` variant, which draws no box at all.
 */
export function useMediaTile({
  variant = "default",
  size,
  style,
}: Pick<ItemMediaProps, "variant" | "size" | "style">) {
  const itemSize = useItemSize();
  const [muted, border] = useThemeColor(["muted", "border"]);
  // Each theme family sets its own rounding, so `rounded-lg` is read, not fixed.
  const radius = dp(useCSSVariable("--radius-lg") as string | number) ?? 8;
  const { backgroundColor } = StyleSheet.flatten(style) ?? {};

  if (variant === "default") return null;

  return {
    side: MEDIA_SIDES[variant][size ?? itemSize],
    radius,
    fill: (backgroundColor as string | undefined) ?? muted,
    border: variant === "icon" ? border : undefined,
  };
}
