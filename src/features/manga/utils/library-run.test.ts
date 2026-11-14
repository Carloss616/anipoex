import { describe, expect, test } from "bun:test";
import {
  type LibraryActivity,
  type LibraryEntry,
  libraryStatus,
  OVERLAP,
  runLibrary,
  type StartActivity,
  scanOrder,
  TAIL_SOURCES,
  topNew,
} from "./library-run";

const entry = (mangaId: number): LibraryEntry => ({
  mangaId,
  name: `Manga ${mangaId}`,
  read: 0,
});
/** A queue over a list the test can still reorder. */
function queueOf(list: LibraryEntry[]) {
  return { list, next: () => list.shift(), left: () => list.length };
}
const probe = (updatedAt: number) => ({ "source-1": { updatedAt } }) as never;
const noop = () => ({ progress() {}, mark() {}, end() {} });

function activity() {
  const ended: unknown[] = [];
  const lines: (string | undefined)[] = [];
  const a: LibraryActivity = {
    manga: () => noop,
    finishing: (line) => lines.push(line),
    end: (s) => ended.push(s),
  };
  return { a, ended, lines };
}
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

/** Scans that start their activity with `total` sources and wait to be ended. */
function heldScans(total: number) {
  const started: number[] = [];
  const held: Record<
    number,
    { activity: ReturnType<StartActivity>; end: () => void }
  > = {};
  const scan = (e: LibraryEntry, start: StartActivity) =>
    new Promise<{ scanned: boolean }>((resolve) => {
      started.push(e.mangaId);
      const activity = start({
        mangaId: e.mangaId,
        name: e.name,
        total,
        sources: [],
      });
      held[e.mangaId] = {
        activity,
        end: () => {
          activity.end(0);
          resolve({ scanned: true });
        },
      };
    });
  return { started, held, scan };
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
    Array.from({ length: n }, (_, i) => ({ mangaId: i, unread: 1 }));
  const base = { total: 42, scanned: 30, recent: 0, picked: 0 };
  test("reports manga with new chapters, picks and recent checks", () => {
    expect(
      libraryStatus({ ...base, recent: 7, picked: 3, withNew: some(5) }),
    ).toBe("5 with new chapters · 3 sources picked · 7 checked recently");
  });
  test("reports none, leaving out zeros", () => {
    expect(libraryStatus({ ...base, withNew: [] })).toBe("No new chapters");
  });
  test("reports where it stopped", () => {
    expect(
      libraryStatus({ ...base, picked: 1, stoppedAt: 12, withNew: some(2) }),
    ).toBe("Stopped at 12 of 42 · 2 with new chapters · 1 source picked");
  });
  test("names the sources skipped as slow", () => {
    expect(
      libraryStatus({
        ...base,
        withNew: [],
        skipped: ["Source A", "Source B"],
      }),
    ).toBe("No new chapters · Skipped slow: Source A, Source B");
  });
});

describe("topNew", () => {
  test("puts the most new chapters first and counts the rest", () => {
    const withNew = [3, 12, 1, 5, 2].map((unread, mangaId) => ({
      mangaId,
      unread,
    }));
    const { top, more } = topNew(withNew);
    expect(top.map((m) => m.unread)).toEqual([12, 5, 3]);
    expect(more).toBe(2);
    expect(topNew(withNew.slice(0, 2)).more).toBe(0);
  });
});

describe("runLibrary", () => {
  test("starts the next manga once one is down to its last sources", async () => {
    const { a } = activity();
    const { started, held, scan } = heldScans(5);
    const run = runLibrary({
      queue: queueOf([entry(1), entry(2), entry(3)]),
      scan,
      unread: () => 0,
      activity: a,
      stopped: () => false,
    });
    await flush();
    held[1].activity.progress(5 - TAIL_SOURCES - 1);
    await flush();
    expect(started).toEqual([1]);
    held[1].activity.progress(5 - TAIL_SOURCES);
    await flush();
    expect(started).toEqual([1, 2]);
    held[2].end();
    held[1].end();
    await flush();
    expect(started).toEqual([1, 2, 3]);
    held[3].end();
    await run;
  });

  test("runs at most OVERLAP manga at once", async () => {
    const { a } = activity();
    const { started, held, scan } = heldScans(5);
    const ids = Array.from({ length: OVERLAP + 1 }, (_, i) => i + 1);
    const run = runLibrary({
      queue: queueOf(ids.map(entry)),
      scan,
      unread: () => 0,
      activity: a,
      stopped: () => false,
    });
    for (const id of ids) {
      await flush();
      held[id]?.activity.progress(5);
    }
    await flush();
    expect(started).toEqual(ids.slice(0, OVERLAP));
    held[1].end();
    await flush();
    expect(started).toEqual(ids);
    for (const id of ids.slice(1)) held[id].end();
    await run;
  });

  test("names one manga behind, and counts several", async () => {
    const { a, lines } = activity();
    const { held, scan } = heldScans(4);
    const run = runLibrary({
      queue: queueOf([entry(1), entry(2), entry(3)]),
      scan,
      unread: () => 0,
      activity: a,
      stopped: () => false,
    });
    await flush();
    held[1].activity.progress(2);
    await flush();
    held[2].activity.progress(3);
    await flush();
    expect(lines).toEqual([
      "Finishing Manga 1 · 2 left",
      "Finishing 2 manga · 3 sources left",
    ]);
    for (const id of [1, 2, 3]) held[id].end();
    await run;
  });

  test("a manga behind the shown one only counts down its finishing line", async () => {
    const { a, lines } = activity();
    const progressed: number[] = [];
    a.manga = () => (args) => ({
      ...noop(),
      progress: () => progressed.push(args.mangaId),
    });
    const { held, scan } = heldScans(3);
    const run = runLibrary({
      queue: queueOf([entry(1), entry(2)]),
      scan,
      unread: () => 0,
      activity: a,
      stopped: () => false,
    });
    await flush();
    held[1].activity.progress(1);
    await flush();
    held[1].activity.progress(2);
    held[1].end();
    held[2].end();
    await run;
    expect(progressed).toEqual([1]);
    expect(lines).toEqual([
      "Finishing Manga 1 · 2 left",
      "Finishing Manga 1 · 1 left",
      undefined,
    ]);
  });

  test("counts a manga as recent only when its sources were probed recently", async () => {
    const { a } = activity();
    const { summary } = await runLibrary({
      queue: queueOf([entry(1), entry(2)]),
      // Manga 2 had nothing to scan: every source excluded or skipped as slow.
      scan: async (e) => ({ scanned: false, recent: e.mangaId === 1 }),
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
      queue: queueOf([entry(1), entry(2)]),
      scan: async (e) =>
        e.mangaId === 1
          ? { scanned: true, picked: { id: "a", previous } }
          : { scanned: true },
      unread: (e) => (e.mangaId === 2 ? 2 : 0),
      activity: a,
      stopped: () => false,
    });
    expect(summary.withNew).toEqual([
      { mangaId: 2, cover: undefined, unread: 2 },
    ]);
    expect(picks).toEqual([{ mangaId: 1, id: "a", previous }]);
  });

  test("counts a retried manga once among those with new chapters", async () => {
    const { a } = activity();
    const { summary } = await runLibrary({
      queue: queueOf([entry(1), { ...entry(1), only: ["source-1"] }]),
      scan: async () => ({ scanned: true }),
      unread: (e) => (e.only ? 3 : 1),
      activity: a,
      stopped: () => false,
    });
    expect(summary.withNew).toEqual([
      { mangaId: 1, cover: undefined, unread: 3 },
    ]);
  });

  test("stops between manga and keeps picks", async () => {
    const { a } = activity();
    const previous = {} as never;
    let done = 0;
    const scanned: number[] = [];
    const { summary, picks } = await runLibrary({
      queue: queueOf([entry(1), entry(2)]),
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

  test("takes each manga when it starts, so a reorder before then counts", async () => {
    const { a } = activity();
    const { started, held, scan } = heldScans(5);
    const queue = queueOf([entry(1), entry(2), entry(3)]);
    const run = runLibrary({
      queue,
      scan,
      unread: () => 0,
      activity: a,
      stopped: () => false,
    });
    await flush();
    queue.list.reverse();
    held[1].activity.progress(5 - TAIL_SOURCES);
    await flush();
    expect(started).toEqual([1, 3]);
    held[1].end();
    held[3].end();
    await flush();
    held[2].end();
    await run;
  });

  test("starts entries queued while the last ones finish", async () => {
    const { a } = activity();
    const { started, held, scan } = heldScans(5);
    const queue = queueOf([entry(1)]);
    let done = false;
    const run = runLibrary({
      queue,
      scan,
      unread: () => 0,
      activity: a,
      stopped: () => false,
    }).then(() => {
      done = true;
    });
    await flush();
    held[1].activity.progress(5 - TAIL_SOURCES);
    await flush();
    queue.list.push(entry(2));
    held[1].end();
    await flush();
    expect(started).toEqual([1, 2]);
    expect(done).toBe(false);
    held[2].end();
    await run;
    expect(done).toBe(true);
  });

  test("reports the total as started plus left", async () => {
    const { a } = activity();
    let started = 0;
    const { summary } = await runLibrary({
      queue: queueOf([entry(1), entry(2), entry(3)]),
      scan: async () => {
        started++;
        return { scanned: true };
      },
      unread: () => 0,
      activity: a,
      stopped: () => started >= 1,
    });
    expect(summary.total).toBe(3);
    expect(summary.stoppedAt).toBe(1);
  });

  test("passes each manga's total to the activity", async () => {
    const { a } = activity();
    const totals: number[] = [];
    a.manga = ({ total }) => {
      totals.push(total);
      return noop;
    };
    const { held, scan } = heldScans(5);
    const queue = queueOf([entry(1), entry(2), entry(3)]);
    const run = runLibrary({
      queue,
      scan,
      unread: () => 0,
      activity: a,
      stopped: () => false,
    });
    await flush();
    queue.list.pop();
    held[1].activity.progress(5 - TAIL_SOURCES);
    await flush();
    expect(totals).toEqual([3, 2]);
    held[1].end();
    held[2].end();
    await run;
  });

  test("ends the activity once with the summary", async () => {
    const { a, ended } = activity();
    const { summary } = await runLibrary({
      queue: queueOf([entry(1)]),
      scan: async () => ({ scanned: true }),
      unread: () => 0,
      activity: a,
      stopped: () => false,
    });
    expect(ended).toEqual([summary]);
  });
});
