import type { PanelThemeFamily, ThemeMode } from "panelui-native/theme";

export type { ThemeMode } from "panelui-native/theme";
export type ThemePreference = ThemeMode | "system";
export type ThemeFamilyId = (typeof THEME_FAMILIES)[number]["id"];

/** PanelUI's family, with room for our own themes (`violet`), which it doesn't ship. */
type ThemeFamily = Omit<PanelThemeFamily, "light" | "dark"> & {
  light: string;
  dark: string;
};

/**
 * The picker's families (ours: `PANEL_THEMES` is a fixed const). `default`,
 * the app icon's violet, stays first: the fallback. `ink` is PanelUI's own
 * `light`/`dark`. A new family ships both halves in `global.base.css`.
 */
export const THEME_FAMILIES = [
  {
    id: "default",
    name: "Default",
    light: "violet",
    dark: "violet-dark",
    swatch: ["#6f3fb3", "#b27cf0"],
  },
  {
    id: "ink",
    name: "Ink",
    light: "light",
    dark: "dark",
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
