import { describe, expect, it } from "bun:test";
import { ramp } from "./ramp";

describe("ramp", () => {
  it("keeps the hue at the clear end, so the fade never grays out", () => {
    const { colors } = ramp("#fbf8ff", { peak: 1 });
    expect(colors[0]).toBe("#fbf8ff00");
    expect(colors.at(-1)).toBe("#fbf8ffff");
  });

  it("replaces an alpha the color already carries", () => {
    expect(ramp("#fbf8ffff").colors[0]).toBe("#fbf8ff00");
  });

  it("flips to start at the peak, for a ramp that floors the top of a frame", () => {
    const { colors, locations } = ramp("#000000", { peak: 1, flip: true });
    expect(colors[0]).toBe("#000000ff");
    expect(colors.at(-1)).toBe("#00000000");
    expect(locations).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  });

  it("walks 0.75·p² by default, the scrim's wash", () => {
    expect(ramp("#000000")).toEqual({
      colors: [
        "#00000000",
        "#00000008",
        "#0000001f",
        "#00000045",
        "#0000007a",
        "#000000bf",
      ],
      locations: [0, 0.2, 0.4, 0.6, 0.8, 1],
    });
  });
});
