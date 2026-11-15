import type { PanelThemeFamily, ThemeMode } from "panelui-native/theme";

export type { ThemeMode } from "panelui-native/theme";
export type ThemePreference = ThemeMode | "system";
export type ThemeFamilyId = (typeof THEME_FAMILIES)[number]["id"];

/** PanelUI's family, with room for our own themes (`ink`), which it doesn't ship. */
type ThemeFamily = Omit<PanelThemeFamily, "light" | "dark"> & {
  light: string;
  dark: string;
};

/**
 * The picker's families (ours: `PANEL_THEMES` is a fixed const). `default`
 * stays first on `light`/`dark`: the fallback, and the only pair Uniwind
 * resolves against the OS. It is the icon's violet, which `global.base.css`
 * paints over PanelUI's neutral pair; that pair is `ink`. A new family ships
 * both halves there.
 */
export const THEME_FAMILIES = [
  {
    id: "default",
    name: "Default",
    light: "light",
    dark: "dark",
    swatch: ["#6f3fb3", "#b27cf0"],
  },
  {
    id: "ink",
    name: "Ink",
    light: "ink",
    dark: "ink-dark",
    swatch: ["#262626", "#f5f5f5"],
  },
  {
    id: "moon",
    name: "Moon",
    light: "moon",
    dark: "moon-dark",
    swatch: ["#5e6ad2", "#5e6ad2"],
  },
  {
    id: "grass",
    name: "Grass",
    light: "grass",
    dark: "grass-dark",
    swatch: ["#24b47e", "#3ecf8e"],
  },
] as const satisfies ThemeFamily[];

/** Every concrete theme name, in registration order. */
export const THEME_NAMES = THEME_FAMILIES.flatMap((family) => [
  family.light,
  family.dark,
]);

/** The names to pass as `extraThemes` in your metro config. */
export const EXTRA_THEMES = THEME_NAMES.filter(
  (name) => name !== "light" && name !== "dark",
);

export type ThemeName = (typeof THEME_NAMES)[number];

/** The family's theme for `mode`; an unknown id falls back to `default`. */
export function familyTheme(id: string, mode: ThemeMode): ThemeName {
  const family =
    THEME_FAMILIES.find((entry) => entry.id === id) ?? THEME_FAMILIES[0];

  return family[mode];
}
