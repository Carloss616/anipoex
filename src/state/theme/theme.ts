// Registers the extra themes, which the `observe` below sets on load. Here, and
// first, because expo-router loads this file before `app/_layout`'s own import.
import "@/global.css";
import { observable, observe } from "@legendapp/state";
import { synced, syncObservable } from "@legendapp/state/sync";
import { Appearance, Platform } from "react-native";
import { Uniwind } from "uniwind";
import { ObservablePersist } from "../observable-persist";
import {
  THEME_FAMILIES,
  type ThemeFamilyId,
  type ThemeMode,
  type ThemePreference,
} from "./constants";

/** The device's scheme, re-read whenever the OS flips. */
const scheme$ = observable(
  synced({
    get: (): ThemeMode => {
      // A `light`/`dark` theme pins Appearance, and `getColorScheme` then
      // reports the pin. `unspecified` restores the OS value.
      if (Platform.OS !== "web" && theme$.preference.peek() === "system") {
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

export const theme$ = observable({
  family: THEME_FAMILIES[0].id as ThemeFamilyId,
  /** What the user picked. Not what is painted — `system` resolves per family. */
  preference: "system" as ThemePreference,
  /** The mode actually being painted, with `system` resolved. */
  mode: (): ThemeMode => {
    const preference = theme$.preference.get();
    return preference === "system" ? scheme$.get() : preference;
  },
});

syncObservable(theme$, {
  persist: { name: "theme", plugin: ObservablePersist },
});

observe(() => {
  const family =
    THEME_FAMILIES.find((entry) => entry.id === theme$.family.get()) ??
    THEME_FAMILIES[0];

  // `default` is Uniwind's own adaptive pair, so hand `system` straight to it.
  if (theme$.preference.get() === "system" && family.id === "default") {
    Uniwind.setTheme("system");
  } else {
    Uniwind.setTheme(family[theme$.mode.get()]);
  }
});
