import { useCSSVariable } from "uniwind";

/** Every colour token PanelUI's theme defines, without the `--color-` prefix. */
export type ThemeColor =
  | "accent"
  | "accent-foreground"
  | "background"
  | "border"
  | "card"
  | "card-foreground"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "destructive"
  | "destructive-foreground"
  | "destructive-soft"
  | "destructive-solid-foreground"
  | "destructive-subtle"
  | "foreground"
  | "info"
  | "info-foreground"
  | "info-soft"
  | "info-solid-foreground"
  | "info-subtle"
  | "input"
  | "inset"
  | "muted"
  | "muted-foreground"
  | "overlay"
  | "overlay-foreground"
  | "popover"
  | "popover-foreground"
  | "primary"
  | "primary-foreground"
  | "ring"
  | "secondary"
  | "secondary-foreground"
  | "skeleton"
  | "success"
  | "success-foreground"
  | "success-soft"
  | "success-solid-foreground"
  | "success-subtle"
  | "surface"
  | "surface-secondary"
  | "surface-tertiary"
  | "warning"
  | "warning-foreground"
  | "warning-soft"
  | "warning-solid-foreground"
  | "warning-subtle";

/**
 * A theme colour, resolved and kept current across theme switches.
 *
 * Reach for it where a colour has to be a value rather than a class: native
 * `@expo/ui` views, React Navigation's theme, an SVG fill. Everywhere else the
 * className is both shorter and cheaper.
 *
 * @example
 * ```ts
 * const border = useThemeColor("border");
 * const [primary, muted] = useThemeColor(["primary", "muted-foreground"]);
 * ```
 */
export function useThemeColor(name: ThemeColor): string;
export function useThemeColor<const T extends readonly ThemeColor[]>(
  names: T,
): { [K in keyof T]: string };
export function useThemeColor(name: ThemeColor | readonly ThemeColor[]) {
  const variable = (
    Array.isArray(name)
      ? name.map((token) => `--color-${token}`)
      : `--color-${name}`
  ) as string & string[];

  return useCSSVariable(variable) as string & string[];
}
