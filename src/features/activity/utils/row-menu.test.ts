import { describe, expect, mock, test } from "bun:test";
import type { MenuAction, MenuItem } from "@/components/ui/menu";

// The registry requires native assets; the menu only needs a name per icon.
mock.module("@/components/ui/icon", () => ({
  Icons: new Proxy({}, { get: (_, name) => String(name) }),
}));
mock.module("./actions", () => ({
  discardPending() {},
  retryUnsent() {},
}));
const { unsentMenu } = await import("./row-menu");

const labels = (items: MenuItem[]) =>
  items.map((i) => ("label" in i ? i.label : ""));
const destructive = (items: MenuItem[]) =>
  labels(items.filter((i) => (i as MenuAction).destructive));

describe("unsent progress's menu", () => {
  test("Retry, and Discard confirmed in a dialog", () => {
    const items = unsentMenu("9") as MenuAction[];
    expect(labels(items)).toEqual(["Retry", "Discard"]);
    expect(destructive(items)).toEqual(["Discard"]);
    expect(items[1].dialogConfig).toEqual({
      title: "Discard this progress?",
      confirmLabel: "Discard",
    });
    const discard = () => {};
    const own = unsentMenu("9", discard) as MenuAction[];
    expect(own[1].onPress).toBe(discard);
    expect(own[1].dialogConfig).toBeUndefined();
  });
});
