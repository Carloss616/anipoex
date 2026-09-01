import { describe, expect, it } from "bun:test";
import type { NativeScrollEvent } from "react-native";
import { collapses } from "./collapses";

const scroll = (y: number, content: number, layout: number) =>
  ({
    contentOffset: { x: 0, y },
    contentSize: { height: content, width: 0 },
    layoutMeasurement: { height: layout, width: 0 },
  }) as NativeScrollEvent;

const state = (collapsed: boolean) => ({ collapsed, givesBack: 64 });

describe("collapses", () => {
  it("collapses once the content moves and still overflows", () => {
    expect(collapses(scroll(1, 2000, 800), state(false))).toBe(true);
  });

  it("stays open at the top", () => {
    expect(collapses(scroll(0, 2000, 800), state(false))).toBe(false);
  });

  it("never collapses when the row it gives back is what makes it scroll", () => {
    expect(collapses(scroll(40, 840, 800), state(false))).toBe(false);
  });

  it("stays collapsed while the taller viewport still overflows", () => {
    expect(collapses(scroll(10, 900, 864), state(true))).toBe(true);
  });

  it("reopens at the top of a collapsed screen", () => {
    expect(collapses(scroll(0, 2000, 864), state(true))).toBe(false);
  });
});
