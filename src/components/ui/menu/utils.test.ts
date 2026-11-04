import { describe, expect, it } from "bun:test";
import type { ReactElement } from "react";
import type { MenuProps } from "./menu";
import { asPress, isPressable, toSegments } from "./utils";

describe("toSegments", () => {
  const row = (label: string) => ({ label, onPress: () => {} });

  it("keeps plain rows in one segment and heads a submenu by its label", () => {
    const segments = toSegments([
      row("Rescan"),
      row("Open"),
      {
        label: "Exclude",
        disabled: true,
        selection: "checkbox",
        items: [row("Outdated"), row("No match")],
      },
      row("Remove"),
    ]);

    expect(
      segments.map((s) => [
        s.heading,
        s.selection,
        s.items.map((r) => [r.label, !!r.disabled]),
      ]),
    ).toEqual([
      [
        undefined,
        undefined,
        [
          ["Rescan", false],
          ["Open", false],
        ],
      ],
      [
        "Exclude",
        "checkbox",
        [
          ["Outdated", true],
          ["No match", true],
        ],
      ],
      [undefined, undefined, [["Remove", false]]],
    ]);
  });

  it("gives a group its own segment, even without a heading", () => {
    const group = { items: [row("Open website")] };
    const segments = toSegments([group, row("Share")]);

    expect(segments.map((s) => s.items.length)).toEqual([1, 1]);
    // A row after a group starts its own segment, leaving the group's array alone.
    expect(group.items).toHaveLength(1);
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
