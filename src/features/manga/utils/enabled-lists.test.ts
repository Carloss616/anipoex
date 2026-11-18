import { describe, expect, it } from "bun:test";
import { enabledLists, renameList } from "./enabled-lists";

describe("renameList", () => {
  it("moves the flag to the new name, in place", () => {
    const value = { "List A": true, "List B": false };
    expect(renameList(value, "List A", "List C")).toEqual({
      "List C": true,
      "List B": false,
    });
  });

  it("leaves anything without that name as it is", () => {
    const value = { "List B": true };
    expect(renameList(value, "List A", "List C")).toBe(value);
    expect(renameList(null, "List A", "List C")).toBeNull();
  });
});

describe("enabledLists", () => {
  it("keeps the names that are on", () => {
    expect(enabledLists({ "List A": true, "List B": false })).toEqual([
      "List A",
    ]);
  });

  it("is empty for anything but a map", () => {
    for (const value of [null, undefined, "x", [1], 3]) {
      expect(enabledLists(value)).toEqual([]);
    }
  });
});
