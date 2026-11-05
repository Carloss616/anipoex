import { describe, expect, it } from "bun:test";
import { SECTION_IDS } from "../constants";
import { sectionVariables } from "./section-variables";

const NOW = new Date(2026, 10, 5);

describe("sectionVariables", () => {
  it("flags exactly the visible sections", () => {
    const vars = sectionVariables(["trending", "genres", "global"], 1, NOW);
    for (const id of SECTION_IDS.filter((id) => id !== "continue"))
      expect(vars[id]).toBe(["trending", "genres", "global"].includes(id));
  });

  it("has no flag for continue", () => {
    expect("continue" in sectionVariables(SECTION_IDS, 1, NOW)).toBe(false);
  });

  it("starts the year at now's January 1st", () => {
    expect(sectionVariables([], 1, NOW).year).toBe(20260000);
  });

  it("passes the user id through", () => {
    expect(sectionVariables([], 42, NOW).userId).toBe(42);
  });
});
