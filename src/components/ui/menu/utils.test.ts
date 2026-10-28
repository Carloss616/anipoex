import { describe, expect, it } from "bun:test";
import { flattenRows } from "./utils";

describe("flattenRows", () => {
  it("lists a submenu's rows after its label, keeping plain rows", () => {
    const rows = flattenRows([
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

  it("lists a group's heading as a disabled row before its rows", () => {
    const rows = flattenRows([
      {
        heading: "Full title",
        items: [{ label: "Open website", onPress: () => {} }],
      },
    ]);

    expect(rows.map((row) => [row.label, !!row.disabled])).toEqual([
      ["Full title", true],
      ["Open website", false],
    ]);
  });
});
