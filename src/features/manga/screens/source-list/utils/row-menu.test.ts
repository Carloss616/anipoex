import { describe, expect, it, mock } from "bun:test";

// The registry requires native assets; the menu only needs a name per icon.
mock.module("@/components/ui/icon", () => ({
  Icons: new Proxy({}, { get: (_, name) => String(name) }),
}));

const { availableRowMenu, excludedRowMenu } = await import("./row-menu");

const source = { id: "s", name: "Source A", homeUrl: "https://a.test" };
const actions = new Proxy({}, { get: () => () => {} });
const row = {
  source,
  url: undefined,
  searching: false,
  scanning: false,
  error: undefined,
  actions,
} as unknown as Parameters<typeof availableRowMenu>[0];
const labels = (items: object[]) =>
  items.map((item) => ("label" in item ? String(item.label) : ""));

describe("availableRowMenu", () => {
  it("leads with Rescan on native and drops it on web", () => {
    const base = { ...row, selected: false, suspicious: false };
    expect(labels(availableRowMenu({ ...base, withRescan: true }))).toEqual([
      "Rescan",
      "Search on Source A",
      "Open website",
      "Exclude",
    ]);
    expect(labels(availableRowMenu({ ...base, withRescan: false }))[0]).toBe(
      "Search on Source A",
    );
  });

  it("swaps Rescan for Stop while scanning, and adds Deselect when picked", () => {
    const items = availableRowMenu({
      ...row,
      scanning: true,
      selected: true,
      suspicious: false,
      withRescan: true,
    });
    expect(labels(items)[0]).toBe("Stop scanning");
    expect(labels(items)).toContain("Deselect");
  });

  it("confirms See error in the menu unless the sheet shows it", () => {
    const base = {
      ...row,
      error: "Timeout",
      selected: false,
      suspicious: false,
      withRescan: false,
    };
    const inMenu = availableRowMenu(base).find(
      (i) => "label" in i && i.label === "See error",
    );
    expect(inMenu).toMatchObject({ onPressMode: "dialog" });
    const inSheet = availableRowMenu({ ...base, onSeeError: () => {} }).find(
      (i) => "label" in i && i.label === "See error",
    );
    expect(inSheet).not.toHaveProperty("onPressMode");
  });
});

describe("excludedRowMenu", () => {
  it("adds Stop and Include only where the row has no button for them", () => {
    const web = { ...row, withStop: false, withInclude: false };
    const ios = { ...row, withStop: true, withInclude: true };
    expect(labels(excludedRowMenu({ ...web, scanning: true }))[0]).toBe(
      "Search on Source A",
    );
    expect(labels(excludedRowMenu(ios))[0]).toBe("Include");
    expect(labels(excludedRowMenu({ ...ios, scanning: true }))[0]).toBe(
      "Stop scanning",
    );
  });
});
