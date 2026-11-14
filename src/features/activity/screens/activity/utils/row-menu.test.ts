import { describe, expect, mock, test } from "bun:test";
import type { MenuAction, MenuItem } from "@/components/ui/menu";

// The registry requires native assets; the menu only needs a name per icon.
mock.module("@/components/ui/icon", () => ({
  Icons: new Proxy({}, { get: (_, name) => String(name) }),
}));
mock.module("./actions", () => ({
  removeFromQueue() {},
  retrySkipped() {},
  scanNext() {},
  stopManga() {},
  stopSource() {},
}));
const { queuedMenu, runningMenu, skippedMenu, sourceMenu } = await import(
  "./row-menu"
);

const labels = (items: MenuItem[]) =>
  items.map((i) => ("label" in i ? i.label : ""));
const destructive = (items: MenuItem[]) =>
  labels(items.filter((i) => (i as MenuAction).destructive));
const open = () => {};

describe("row menus", () => {
  test("a running manga's", () => {
    const items = runningMenu(1, { expanded: false, open });
    expect(labels(items)).toEqual([
      "Open manga",
      "Show sources",
      "Stop this manga",
    ]);
    expect(destructive(items)).toEqual(["Stop this manga"]);
    expect(labels(runningMenu(1, { expanded: true, open }))[1]).toBe(
      "Hide sources",
    );
  });

  test("a queued manga's", () => {
    const items = queuedMenu("7", open);
    expect(labels(items)).toEqual([
      "Scan next",
      "Open manga",
      "Remove from queue",
    ]);
    expect(destructive(items)).toEqual(["Remove from queue"]);
  });

  test("a source's and a skipped source's", () => {
    expect(labels(sourceMenu(1, "source-1"))).toEqual(["Stop this source"]);
    expect(destructive(sourceMenu(1, "source-1"))).toEqual([
      "Stop this source",
    ]);
    expect(labels(skippedMenu("source-1"))).toEqual(["Retry"]);
  });
});
