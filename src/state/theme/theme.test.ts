import { expect, mock, test } from "bun:test";

const setTheme = mock((_: string) => {});
let osScheme: "light" | "dark" = "light";
let notifyOS = () => {};

// Stubs for everything the store touches that needs a device: the OS scheme,
// the persistence plugin and Uniwind's setter. `THEME_FAMILIES` is real.
mock.module("react-native", () => ({
  Platform: { OS: "ios" },
  Appearance: {
    getColorScheme: () => osScheme,
    setColorScheme: () => {},
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

const { theme$ } = await import("./theme");

test("hands `system` to Uniwind for the family it can resolve itself", () => {
  expect(setTheme).toHaveBeenLastCalledWith("system");
});

test("resolves `system` to the custom family's own dark theme", () => {
  osScheme = "dark";
  notifyOS();
  theme$.family.set("moon");

  expect(setTheme).toHaveBeenLastCalledWith("moon-dark");
});

test("follows the OS while the custom family is on `system`", () => {
  osScheme = "light";
  notifyOS();

  expect(setTheme).toHaveBeenLastCalledWith("moon");
});

test("an explicit mode wins over the OS", () => {
  theme$.preference.set("dark");

  expect(setTheme).toHaveBeenLastCalledWith("moon-dark");
});

test("keeps the mode when the family changes", () => {
  theme$.family.set("default");

  expect(setTheme).toHaveBeenLastCalledWith("dark");
});
