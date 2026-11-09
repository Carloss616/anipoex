// Registers the extra themes, which the `observe` below sets on load. Here, and
// first, because expo-router loads this file before `app/_layout`'s own import.
import "@/global.css";

import { observable, observe } from "@legendapp/state";
import { synced } from "@legendapp/state/sync";
import { Appearance, Platform } from "react-native";
import { Uniwind } from "uniwind";
import { settings$ } from "../settings";
import { THEME_FAMILIES, type ThemeMode } from "./constants";

/** The device's scheme, re-read whenever the OS flips. */
const scheme$ = observable(
  synced({
    get: (): ThemeMode => {
      // A `light`/`dark` theme pins Appearance, and `getColorScheme` then
      // reports the pin. `unspecified` restores the OS value.
      if (
        Platform.OS !== "web" &&
        settings$.theme.preference.peek() === "system"
      ) {
        Appearance.setColorScheme("unspecified");
      }

      return Appearance.getColorScheme() === "dark" ? "dark" : "light";
    },
    subscribe: ({ refresh }) => {
      const subscription = Appearance.addChangeListener(refresh);

      return () => subscription.remove();
    },
  }),
);

/** The mode actually being painted, with `system` resolved. */
export const themeMode$ = observable((): ThemeMode => {
  const preference = settings$.theme.preference.get();
  return preference === "system" ? scheme$.get() : preference;
});

observe(() => {
  const mode = themeMode$.get();
  const family =
    THEME_FAMILIES.find((entry) => entry.id === settings$.theme.family.get()) ??
    THEME_FAMILIES[0];

  // `default` is Uniwind's own adaptive pair, so hand `system` straight to it.
  if (
    settings$.theme.preference.get() === "system" &&
    family.id === "default"
  ) {
    Uniwind.setTheme("system");
  } else {
    Uniwind.setTheme(family[mode]);
  }

  // Uniwind pins Appearance only for `light`/`dark`; native sheets follow it.
  if (Platform.OS !== "web" && settings$.theme.preference.get() !== "system")
    Appearance.setColorScheme(mode);

  const hasWindow = typeof window !== "undefined";
  if (Platform.OS === "web" && hasWindow) {
    const root = document.documentElement;
    root.style.colorScheme = mode;
    // Uniwind scopes `dark:` to `.dark`: a family's dark half needs it too.
    root.classList.toggle("dark", mode === "dark");
  }
});
