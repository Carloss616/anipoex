import { describe, expect, it } from "bun:test";
import { listNameError, removalPlan } from "./custom-lists";

describe("listNameError", () => {
  it("needs a name", () => {
    expect(listNameError("", [])).toBe("Enter a name");
    expect(listNameError("  ", [])).toBe("Enter a name");
  });

  it("refuses a name the account has, in any case", () => {
    expect(listNameError(" to reread ", ["To reread"])).toBe(
      "You already have this list",
    );
  });

  it("takes a new name", () => {
    expect(listNameError("List B", ["List A"])).toBeNull();
  });
});

describe("removalPlan", () => {
  const group = (name: string, ids: number[], isCustomList = true) => ({
    name,
    isCustomList,
    entries: ids.map((id) => ({ id })),
  });
  const groups = [
    group("Reading", [1, 2, 3, 4], false),
    group("List A", [1, 2]),
    group("List B", [2, 3]),
    group("List C", [3]),
  ];
  const names = ["List A", "List B", "List C"];

  it("saves again every entry in the deleted list or a later one", () => {
    expect(removalPlan(names, groups, "List B")).toEqual({
      next: ["List A", "List C"],
      resaves: [
        { id: 2, customLists: ["List A"] },
        { id: 3, customLists: ["List C"] },
      ],
    });
  });

  it("saves the deleted list's entries again even when it's last", () => {
    expect(removalPlan(names, groups, "List C")).toEqual({
      next: ["List A", "List B"],
      resaves: [{ id: 3, customLists: ["List B"] }],
    });
  });

  it("changes nothing for a name the account doesn't have", () => {
    expect(removalPlan(names, groups, "Gone")).toEqual({
      next: names,
      resaves: [],
    });
  });

  it("keeps entries only in earlier lists out of it", () => {
    const ids = removalPlan(names, groups, "List A").resaves.map((r) => r.id);
    expect(ids).toEqual([1, 2, 3]);
  });
});
