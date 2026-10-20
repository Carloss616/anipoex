import { describe, expect, test } from "bun:test";
import { dialogActions } from "./utils";

const base = { title: "T" };
const noop = () => {};

describe("dialogActions", () => {
  test("a single confirm gets the built-in Cancel", () => {
    const { actions, cancel } = dialogActions({
      ...base,
      confirmLabel: "OK",
      onConfirm: noop,
      role: "destructive",
    });
    expect(actions.map((a) => [a.label, a.role])).toEqual([
      ["OK", "destructive"],
    ]);
    expect([cancel.label, cancel.role]).toEqual(["Cancel", "cancel"]);
  });

  test("a cancel action replaces the built-in Cancel", () => {
    const keep = { label: "Keep", onPress: noop, role: "cancel" as const };
    const { actions, cancel } = dialogActions({
      ...base,
      cancelLabel: "Unused",
      actions: [{ label: "A", onPress: noop }, keep],
    });
    expect(actions.map((a) => a.label)).toEqual(["A"]);
    expect(cancel).toBe(keep);
  });
});
