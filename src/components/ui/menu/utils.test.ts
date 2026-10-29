import { describe, expect, it } from "bun:test";
import type { ReactElement } from "react";
import type { MenuProps } from "./menu";
import { asPress, flattenRows, isPressable } from "./utils";

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

describe("asPress", () => {
  const trigger = (props: object) =>
    ({ props }) as ReactElement as MenuProps["children"];

  it("treats a trigger passed with onPress, even undefined, as a pressable", () => {
    expect(isPressable(trigger({ onPress: undefined }))).toBe(true);
    expect(isPressable(trigger({ "aria-label": "More" }))).toBe(false);
  });

  it("runs the trigger's own press, then the menu's click", () => {
    const calls: string[] = [];
    const press = asPress(
      { onClick: () => calls.push("menu") },
      trigger({ onPress: () => calls.push("own") }),
    );
    press.onPress(undefined as never);
    expect(calls).toEqual(["own", "menu"]);
  });
});
