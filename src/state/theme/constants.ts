import type { PanelThemeFamily, ThemeMode } from "panelui-native";

export type { ThemeMode } from "panelui-native";
export type ThemePreference = ThemeMode | "system";
export type ThemeFamilyId = (typeof THEME_FAMILIES)[number]["id"];

/**
 * The families the picker offers — ours, since `PANEL_THEMES` is a fixed const.
 * `default` stays first on `light`/`dark`: the fallback, and the only pair
 * Uniwind resolves against the OS. A new one ships both halves in `global.css`.
 */
export const THEME_FAMILIES = [
  {
    id: "default",
    name: "Default",
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
] as const satisfies PanelThemeFamily[];

/** Every concrete theme name, in registration order. */
export const THEME_NAMES = THEME_FAMILIES.flatMap((family) => [
  family.light,
  family.dark,
]);

/** The names to pass as `extraThemes` in your metro config. */
export const EXTRA_THEMES = THEME_NAMES.filter(
  (name) => name !== "light" && name !== "dark",
);
