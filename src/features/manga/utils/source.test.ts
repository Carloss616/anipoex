import { describe, expect, it } from "bun:test";
import { initialsOf } from "./source";

describe("initialsOf", () => {
  it("takes the capitals, or the first letters of two words", () => {
    expect(initialsOf("ExampleSource")).toBe("ES");
    expect(initialsOf("Example Scans")).toBe("ES");
    expect(initialsOf("ExampleX")).toBe("EX");
    expect(initialsOf("Example")).toBe("EX");
  });

  it("gives nothing for an empty name", () => {
    expect(initialsOf("")).toBe("");
  });
});
