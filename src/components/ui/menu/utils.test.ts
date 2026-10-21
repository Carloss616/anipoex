import { describe, expect, it } from "bun:test";
import { flattenSubmenus } from "./utils";

describe("flattenSubmenus", () => {
  it("lists a submenu's rows after its label, keeping plain rows", () => {
    const rows = flattenSubmenus([
      { label: "Rescan", onPress: () => {} },
      {
        label: "Exclude",
        disabled: true,
        items: [
          { label: "Outdated", onPress: () => {} },
          { label: "No match", onPress: () => {} },
        ],
      },
    ]);

    expect(rows.map((row) => [row.label, !!row.disabled])).toEqual([
      ["Rescan", false],
      ["Exclude: Outdated", true],
      ["Exclude: No match", true],
    ]);
  });
});
