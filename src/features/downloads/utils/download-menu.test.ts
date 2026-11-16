import { describe, expect, mock, test } from "bun:test";

mock.module("@/state/observable-persist", () => ({
  ObservablePersist: class {
    getTable() {
      return {};
    }
    set() {}
    deleteTable() {}
    getMetadata() {
      return {};
    }
    setMetadata() {}
    deleteMetadata() {}
  },
}));

const { downloadMenu } = await import("./download-menu");
const { chapterHash } = await import("./paths");

import type { Chapter } from "@/features/manga/utils/to-chapters";

const ch = (number: number) =>
  ({
    id: `https://example.com/c/${number}`,
    number,
    title: `Chapter ${number}`,
    date: "",
    scanlator: null,
    memo: "",
  }) as Chapter;

const chapters = Array.from({ length: 12 }, (_, i) => ch(12 - i));
const manga = { id: 314, title: "Manga" };
const source = { id: "source-1", name: "Source A" };

function build(downloaded: Chapter[] = [], progress = 0) {
  const calls = {
    enqueued: [] as unknown[][],
    started: 0,
    messages: [] as string[],
    removed: [] as unknown[][],
  };
  const menu = downloadMenu({
    manga,
    source,
    chapters,
    progress,
    downloadedHashes: new Set(downloaded.map((c) => chapterHash(c.id))),
    notify: (m) => calls.messages.push(m),
    enqueue: (items) => {
      calls.enqueued.push(items);
      return items.length;
    },
    start: () => calls.started++,
    remove: (async (...args: unknown[]) => {
      calls.removed.push(args);
    }) as never,
  });
  const row = (label: string) => menu.items.find((i) => i.label === label);
  return { menu, calls, row };
}

describe("downloadMenu", () => {
  test("with everything downloaded the five download rows are disabled", () => {
    const { menu } = build(chapters);
    expect(menu.items.slice(0, 5).map((i) => i.disabled)).toEqual(
      Array(5).fill(true),
    );
    expect(menu.items[5].disabled).toBe(false);
  });

  test("with no downloads, delete is disabled", () => {
    const { row } = build();
    expect(row("Delete downloads")?.disabled).toBe(true);
    expect(row("Next 5")?.disabled).toBe(false);
  });

  test("Next 5 enqueues 5, starts and says so", () => {
    const { row, calls } = build();
    row("Next 5")?.onPress();
    expect(calls.enqueued[0]).toHaveLength(5);
    expect(calls.started).toBe(1);
    expect(calls.messages).toEqual(["Downloading 5 chapters"]);
  });

  test("a single chapter is singular", () => {
    const { row, calls } = build();
    row("Next chapter")?.onPress();
    expect(calls.messages).toEqual(["Downloading 1 chapter"]);
  });

  test("delete confirms and removes every downloaded hash", () => {
    const done = [ch(1), ch(2)];
    const { row, calls } = build(done);
    const item = row("Delete downloads");
    expect(item?.onPressMode).toBe("dialog");
    expect(item?.destructive).toBe(true);
    item?.onPress();
    expect(calls.removed[0]).toEqual([
      314,
      "source-1",
      done.map((c) => chapterHash(c.id)),
    ]);
  });
});
