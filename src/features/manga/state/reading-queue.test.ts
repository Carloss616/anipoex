import { afterEach, describe, expect, test } from "bun:test";
import type { LibraryEntry } from "../utils/library-run";
import {
  clearQueue,
  endRun,
  fillQueue,
  queueRetry,
  readingQueue,
  readingQueue$,
  readingRun$,
  removeFromQueue,
  scanNext,
  settle,
} from "./reading-queue";

const entry = (mangaId: number): LibraryEntry => ({
  mangaId,
  name: `Manga ${mangaId}`,
  read: 0,
});
const queued = () =>
  Object.values(readingQueue$.peek())
    .filter((m) => m.state === "queued")
    .sort((a, b) => a.order - b.order);

afterEach(endRun);

describe("readingQueue", () => {
  test("hands out manga in order and marks them running", () => {
    fillQueue([entry(1), entry(2)]);
    expect(readingQueue.left()).toBe(2);
    const first = readingQueue.next();
    expect(first?.mangaId).toBe(1);
    expect(readingQueue$[first?.id ?? ""].state.peek()).toBe("running");
    expect(readingQueue.left()).toBe(1);
    expect(readingQueue.next()?.mangaId).toBe(2);
    expect(readingQueue.next()).toBeUndefined();
  });

  test("scanNext moves a manga to the front", () => {
    fillQueue([entry(1), entry(2), entry(3)]);
    scanNext(queued()[2].id);
    expect(readingQueue.next()?.mangaId).toBe(3);
  });

  test("ignores Remove and Scan next once a manga runs", () => {
    fillQueue([entry(1), entry(2)]);
    const running = readingQueue.next();
    if (!running) throw new Error("no manga");
    scanNext(running.id);
    removeFromQueue(running.id);
    expect(readingQueue$[running.id].peek()).toMatchObject({
      state: "running",
      order: running.order,
    });
  });

  test("removeFromQueue drops a queued manga", () => {
    fillQueue([entry(1), entry(2)]);
    removeFromQueue(queued()[0].id);
    expect(readingQueue.next()?.mangaId).toBe(2);
  });

  test("clearQueue keeps the running ones", () => {
    fillQueue([entry(1), entry(2), entry(3)]);
    const running = readingQueue.next();
    clearQueue();
    expect(Object.keys(readingQueue$.peek())).toEqual([running?.id ?? ""]);
    expect(readingQueue.left()).toBe(0);
  });

  test("settle counts it done", () => {
    fillQueue([entry(1)]);
    const running = readingQueue.next();
    settle(running?.id ?? "");
    expect(readingQueue$.peek()).toEqual({});
    expect(readingRun$.done.peek()).toBe(1);
  });

  test("fillQueue starts a fresh run and endRun empties both", () => {
    fillQueue([entry(1)]);
    expect(readingRun$.peek()).toMatchObject({
      done: 0,
      withNew: {},
      skipped: {},
    });
    endRun();
    expect(readingQueue$.peek()).toEqual({});
    expect(readingRun$.peek()).toBeNull();
  });
});

describe("queueRetry", () => {
  test("adds a retry at the end with only that source", () => {
    fillQueue([entry(1), entry(2)]);
    readingQueue.next();
    queueRetry(entry(1), "source-1");
    const last = queued().at(-1);
    expect(last).toMatchObject({ mangaId: 1, only: ["source-1"] });
    expect(queued()).toHaveLength(2);
  });

  test("adds a second source to a queued retry of the same manga", () => {
    fillQueue([entry(1)]);
    readingQueue.next();
    queueRetry(entry(1), "source-1");
    queueRetry(entry(1), "source-2");
    expect(queued()).toHaveLength(1);
    expect(queued()[0].only).toEqual(["source-1", "source-2"]);
  });

  test("does nothing for a manga still queued for every source", () => {
    fillQueue([entry(1), entry(2)]);
    queueRetry(entry(2), "source-1");
    expect(queued()).toHaveLength(2);
    expect(queued()[1].only).toBeUndefined();
  });
});
