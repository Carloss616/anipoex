import { describe, expect, it } from "bun:test";
import { trackColorOf } from "./utils";

describe("trackColorOf", () => {
  it("adds 20% alpha to a six-digit hex, replacing its own", () => {
    expect(trackColorOf("#262626")).toBe("#26262633");
    expect(trackColorOf("#262626ff")).toBe("#26262633");
  });

  it("expands a short hex first", () => {
    expect(trackColorOf("#fff")).toBe("#ffffff33");
    expect(trackColorOf("#fffa")).toBe("#ffffff33");
  });

  it("leaves other colors to the theme", () => {
    expect(trackColorOf(undefined)).toBeUndefined();
    expect(trackColorOf("rgba(0, 0, 0, 0.5)")).toBeUndefined();
  });
});
