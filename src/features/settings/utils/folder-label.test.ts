import { describe, expect, it } from "bun:test";
import { folderLabel } from "./folder-label";

describe("folderLabel", () => {
  it("names the folder, or says none is chosen", () => {
    expect(folderLabel("/Users/me/Comics/")).toBe("Comics");
    expect(folderLabel(undefined)).toBe("None chosen");
  });
});
