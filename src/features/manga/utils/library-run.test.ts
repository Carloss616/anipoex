import { describe, expect, test } from "bun:test";
import {
  type LibraryActivity,
  type LibraryEntry,
  libraryStatus,
  runLibrary,
  scanOrder,
} from "./library-run";

const entry = (mangaId: number): LibraryEntry => ({
  mangaId,
  name: `Manga ${mangaId}`,
  read: 0,
});
const probe = (updatedAt: number) => ({ "source-1": { updatedAt } }) as never;
const noop = () => ({ progress() {}, mark() {}, end() {} });

function activity() {
  const ended: unknown[] = [];
  const a: LibraryActivity = { manga: () => noop, end: (s) => ended.push(s) };
  return { a, ended };
}

describe("scanOrder", () => {
  test("puts unprobed manga first, then the stalest", () => {
    const order = scanOrder([{ mangaId: 1 }, { mangaId: 2 }, { mangaId: 3 }], {
      "1": probe(300),
      "3": probe(100),
    });
    expect(order.map((e) => e.mangaId)).toEqual([2, 3, 1]);
  });
});

describe("libraryStatus", () => {
  const some = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ mangaId: i }));
  test("reports manga with new chapters", () => {
    expect(
      libraryStatus({ total: 42, scanned: 30, recent: 7, withNew: some(5) }),
    ).toBe("5 with new chapters · 30 scanned · 7 recent");
  });
  test("reports none", () => {
    expect(
      libraryStatus({ total: 42, scanned: 30, recent: 7, withNew: [] }),
    ).toBe("No new chapters · 30 scanned · 7 recent");
  });
  test("reports where it stopped", () => {
    expect(
      libraryStatus({
        total: 42,
        scanned: 11,
        recent: 0,
        stoppedAt: 12,
        withNew: some(2),
      }),
    ).toBe("Stopped at 12 of 42 · 2 with new chapters · 11 scanned · 0 recent");
  });
});

describe("runLibrary", () => {
  test("runs one manga at a time", async () => {
    let running = 0;
    let overlap = false;
    const { a } = activity();
    await runLibrary({
      entries: [entry(1), entry(2), entry(3)],
      scan: async () => {
        running++;
        overlap ||= running > 1;
        await Promise.resolve();
        running--;
        return { scanned: true };
      },
      unread: () => 0,
      activity: a,
      stopped: () => false,
    });
    expect(overlap).toBe(false);
  });

  test("counts a skipped manga as recent", async () => {
    const { a } = activity();
    const { summary } = await runLibrary({
      entries: [entry(1)],
      scan: async () => ({ scanned: false }),
      unread: () => 0,
      activity: a,
      stopped: () => false,
    });
    expect(summary.recent).toBe(1);
    expect(summary.scanned).toBe(0);
  });

  test("collects picks and manga with new chapters", async () => {
    const { a } = activity();
    const previous = {} as never;
    const { summary, picks } = await runLibrary({
      entries: [entry(1), entry(2)],
      scan: async (e) =>
        e.mangaId === 1
          ? { scanned: true, picked: { id: "a", previous } }
          : { scanned: true },
      unread: (e) => (e.mangaId === 2 ? 2 : 0),
      activity: a,
      stopped: () => false,
    });
    expect(summary.withNew).toEqual([{ mangaId: 2, cover: undefined }]);
    expect(picks).toEqual([{ mangaId: 1, id: "a", previous }]);
  });

  test("stops between manga and keeps picks", async () => {
    const { a } = activity();
    const previous = {} as never;
    let done = 0;
    const scanned: number[] = [];
    const { summary, picks } = await runLibrary({
      entries: [entry(1), entry(2)],
      scan: async (e) => {
        scanned.push(e.mangaId);
        done++;
        return { scanned: true, picked: { id: "a", previous } };
      },
      unread: () => 0,
      activity: a,
      stopped: () => done >= 1,
    });
    expect(scanned).toEqual([1]);
    expect(summary.stoppedAt).toBe(1);
    expect(picks).toHaveLength(1);
  });

  test("ends the activity once with the summary", async () => {
    const { a, ended } = activity();
    const { summary } = await runLibrary({
      entries: [entry(1)],
      scan: async () => ({ scanned: true }),
      unread: () => 0,
      activity: a,
      stopped: () => false,
    });
    expect(ended).toEqual([summary]);
  });
});
