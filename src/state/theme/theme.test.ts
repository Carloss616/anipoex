import { expect, mock, test } from "bun:test";

const setTheme = mock((_: string) => {});
const setColorScheme = mock((_: string) => {});
let osScheme: "light" | "dark" = "light";
let notifyOS = () => {};

// Stubs for everything the store touches that needs a device: the OS scheme,
// the persistence plugin and Uniwind's setter. `THEME_FAMILIES` is real.
mock.module("react-native", () => ({
  Platform: { OS: "ios" },
  Appearance: {
    getColorScheme: () => osScheme,
    setColorScheme,
    addChangeListener: (listener: () => void) => {
      notifyOS = listener;

      return { remove: () => {} };
    },
  },
}));
mock.module("../observable-persist", () => ({
  ObservablePersist: class {
    getTable = () => undefined;
    getMetadata = () => undefined;
    set = () => {};
    setMetadata = () => {};
    deleteTable = () => {};
    deleteMetadata = () => {};
  },
}));
mock.module("uniwind", () => ({ Uniwind: { setTheme } }));
mock.module("panelui-native", () => ({}));
const { settings$ } = await import("@/state/settings");
await import("./theme");

test("hands `system` to Uniwind for the family it can resolve itself", () => {
  expect(setTheme).toHaveBeenLastCalledWith("system");
});

test("resolves `system` to the custom family's own dark theme", () => {
  osScheme = "dark";
  notifyOS();
  settings$.theme.family.set("moon");

  expect(setTheme).toHaveBeenLastCalledWith("moon-dark");
});

test("follows the OS while the custom family is on `system`", () => {
  osScheme = "light";
  notifyOS();

  expect(setTheme).toHaveBeenLastCalledWith("moon");
});

test("an explicit mode wins over the OS", () => {
  settings$.theme.preference.set("dark");

  expect(setTheme).toHaveBeenLastCalledWith("moon-dark");
  // Uniwind leaves a custom family unpinned, so the store pins it.
  expect(setColorScheme).toHaveBeenLastCalledWith("dark");
});

test("keeps the mode when the family changes", () => {
  settings$.theme.family.set("default");

  expect(setTheme).toHaveBeenLastCalledWith("dark");
});

test("on web, a custom family's dark half also gets `dark` for `dark:`", async () => {
  const { Platform } = await import("react-native");
  const toggle = mock((_: string, __: boolean) => {});
  Object.assign(globalThis, {
    window: {},
    document: { documentElement: { style: {}, classList: { toggle } } },
  });
  Platform.OS = "web";

  try {
    settings$.theme.family.set("moon");
    expect(setTheme).toHaveBeenLastCalledWith("moon-dark");
    expect(toggle).toHaveBeenLastCalledWith("dark", true);

    settings$.theme.preference.set("light");
    expect(toggle).toHaveBeenLastCalledWith("dark", false);
  } finally {
    Platform.OS = "ios";
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "document");
  }
});
