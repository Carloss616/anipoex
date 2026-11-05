import { describe, expect, it, mock } from "bun:test";
import { PRESETS, SECTION_IDS } from "../constants";

mock.module("@/state/observable-persist", () => ({
  ObservablePersist: class {
    getTable() {
      return {};
    }
    set() {}
    deleteTable() {}
    getMetadata() {
      return {};
    }
    setMetadata() {}
    deleteMetadata() {}
  },
}));

const {
  homeLayout$,
  layoutSummary,
  moved,
  normalizeLayout,
  toggled,
  visibleSections,
  withPreset,
} = await import("./home-layout");

describe("withPreset", () => {
  it("turns on the preset's ids and orders them first", () => {
    const layout = withPreset("balanced");
    expect(layout.preset).toBe("balanced");
    expect(layout.on).toEqual(PRESETS.balanced);
    expect(layout.order.slice(0, PRESETS.balanced.length)).toEqual(
      PRESETS.balanced,
    );
    expect([...layout.order].sort()).toEqual([...SECTION_IDS].sort());
  });
});

describe("toggled", () => {
  it("adds an id that's off and removes one that's on", () => {
    const layout = withPreset("balanced");
    const added = toggled(layout, "top");
    expect(added.on).toContain("top");
    expect(added.preset).toBe("custom");
    const removed = toggled(layout, "trending");
    expect(removed.on).not.toContain("trending");
    expect(removed.preset).toBe("custom");
  });
});

describe("moved", () => {
  it("moves an id and clamps the target", () => {
    const layout = withPreset("balanced");
    expect(moved(layout, "top", 0).order[0]).toBe("top");
    expect(moved(layout, "top", 99).order.at(-1)).toBe("top");
    expect(moved(layout, "top", 0).preset).toBe("custom");
    expect(moved(layout, "top", 0).order).toHaveLength(SECTION_IDS.length);
  });
});

describe("visibleSections", () => {
  it("keeps the order and drops ids that are off", () => {
    const layout = moved(withPreset("balanced"), "new", 0);
    expect(visibleSections(layout)).toEqual([
      "new",
      ...PRESETS.balanced.filter((id) => id !== "new"),
    ]);
  });
});

describe("layoutSummary", () => {
  it("names the preset and counts the visible sections", () => {
    const balanced = withPreset("balanced");
    expect(layoutSummary(balanced)).toBe(
      `Balanced · ${PRESETS.balanced.length} sections`,
    );
    expect(layoutSummary({ ...balanced, preset: "custom", on: ["top"] })).toBe(
      "Custom · 1 section",
    );
  });
});

describe("normalizeLayout", () => {
  it("drops unknown ids and appends missing ones hidden", () => {
    const layout = normalizeLayout({
      preset: "balanced",
      order: ["trending", "bogus"],
      on: ["trending", "bogus"],
    });
    expect(layout.preset).toBe("balanced");
    expect(layout.on).toEqual(["trending"]);
    expect(layout.order[0]).toBe("trending");
    expect([...layout.order].sort()).toEqual([...SECTION_IDS].sort());
  });

  it("falls back to balanced for anything else", () => {
    expect(normalizeLayout(null)).toEqual(withPreset("balanced"));
    expect(normalizeLayout({ preset: "nope", order: 1 })).toEqual(
      withPreset("balanced"),
    );
  });
});

describe("homeLayout$", () => {
  it("defaults to balanced", () => {
    expect(homeLayout$.get()).toEqual(withPreset("balanced"));
  });
});
