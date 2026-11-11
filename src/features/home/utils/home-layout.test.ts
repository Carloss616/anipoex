import { describe, expect, it } from "bun:test";
import { PRESETS, SECTION_IDS } from "../constants";

import {
  type HomeLayout,
  moved,
  normalizeLayout,
  toggled,
  visibleSections,
  withPreset,
} from "./home-layout";

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

  it("matches the preset again once its sections are back", () => {
    const layout = withPreset("balanced");
    expect(toggled(toggled(layout, "top"), "top").preset).toBe("balanced");
    expect(toggled(toggled(layout, "new"), "new").preset).toBe("balanced");
    expect(moved(moved(layout, "new", 0), "new", 6).preset).toBe("balanced");
  });

  it("matches another preset reached by hand", () => {
    const personal = withPreset("personal");
    const layout: HomeLayout = {
      ...withPreset("balanced"),
      on: [],
      preset: "custom",
    };
    const built = personal.on.reduce(
      (acc, id, i) => moved(toggled(acc, id), id, i),
      layout,
    );
    expect(built.preset).toBe("personal");
  });
});

describe("moved", () => {
  it("moves an id and clamps the target", () => {
    const layout = withPreset("balanced");
    expect(moved(layout, "top", 0).order[0]).toBe("top");
    expect(moved(layout, "top", 99).order.at(-1)).toBe("top");
    expect(moved(layout, "top", 0).preset).toBe("balanced");
    expect(moved(layout, "new", 0).preset).toBe("custom");
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
