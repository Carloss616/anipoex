import { describe, expect, it } from "bun:test";
import type { QueuedDownload } from "../state/download-queue";
import {
  activityView,
  countStatus,
  downloadTitle,
  endStatus,
  startTally,
  tallyQueue,
} from "./activity-view";

const entry = (
  key: string,
  order: number,
  state: QueuedDownload["state"] = "queued",
  number = order + 1,
): QueuedDownload => ({
  key,
  order,
  state,
  manga: { id: 21, title: "Manga" },
  source: { id: "source-1", name: "Source A" },
  chapter: { url: key, name: "", number, scanlator: null, memo: null },
});
const queueOf = (...entries: QueuedDownload[]) =>
  Object.fromEntries(entries.map((e) => [e.key, e]));
const downloaded =
  (...keys: string[]) =>
  (key: string) =>
    keys.includes(key);

describe("downloadTitle", () => {
  it("names the chapter by number, else by name, else Chapter", () => {
    expect(downloadTitle("Manga", { number: 12, name: "Ep" })).toBe(
      "Manga · Chapter 12",
    );
    expect(downloadTitle("Manga", { number: -1, name: "Extra" })).toBe(
      "Manga · Extra",
    );
    expect(downloadTitle("Manga", { number: -1, name: "" })).toBe(
      "Manga · Chapter",
    );
  });
});

describe("tallyQueue", () => {
  it("counts a chapter gone and downloaded as done, not a cancelled one", () => {
    let tally = startTally(
      queueOf(entry("a", 0), entry("b", 1), entry("c", 2)),
    );
    tally = tallyQueue(tally, queueOf(entry("c", 2)), downloaded("a"));
    expect(tally.done).toBe(1);
    expect(tally.failed).toEqual([]);
  });

  it("counts only failures since it started, and forgets a retried one", () => {
    let tally = startTally(queueOf(entry("old", 0, "failed"), entry("a", 1)));
    tally = tallyQueue(
      tally,
      queueOf(entry("old", 0, "failed"), entry("a", 1, "failed")),
      downloaded(),
    );
    expect(tally.failed).toEqual(["a"]);
    tally = tallyQueue(
      tally,
      queueOf(entry("old", 0, "failed"), entry("a", 1, "running")),
      downloaded(),
    );
    expect(tally.failed).toEqual([]);
  });

  it("keeps a failure counted while it stays failed", () => {
    let tally = startTally(queueOf(entry("a", 0)));
    tally = tallyQueue(tally, queueOf(entry("a", 0, "failed")), downloaded());
    tally = tallyQueue(tally, queueOf(entry("a", 0, "failed")), downloaded());
    expect(tally.failed).toEqual(["a"]);
  });
});

describe("activityView", () => {
  it("shows the first running chapter and its progress", () => {
    const queue = queueOf(
      entry("a", 0, "queued"),
      entry("b", 1, "running"),
      entry("c", 2, "running"),
      entry("old", 3, "failed"),
    );
    const tally = { done: 2, failed: [], states: {} };
    expect(activityView(tally, queue, { b: 0.5, c: 0.2 })).toEqual({
      title: "Manga · Chapter 2",
      done: 2,
      total: 5,
      fraction: 0.5,
    });
  });

  it("counts this run's failures in the total", () => {
    const queue = queueOf(entry("a", 0), entry("b", 1, "failed"));
    const tally = { done: 1, failed: ["b"], states: {} };
    expect(activityView(tally, queue, {})).toEqual({
      title: "Manga · Chapter 1",
      done: 1,
      total: 3,
      fraction: 0,
    });
  });

  it("is nothing when no chapter is running or queued", () => {
    const queue = queueOf(entry("a", 0, "failed"));
    expect(activityView(startTally(queue), queue, {})).toBeUndefined();
  });
});

describe("status", () => {
  it("counts what's downloaded", () => {
    expect(countStatus({ done: 2, total: 5 })).toBe("2 of 5 downloaded");
  });

  it("sums up the end", () => {
    expect(endStatus({ done: 1, failed: 0 })).toBe("1 chapter downloaded");
    expect(endStatus({ done: 3, failed: 2 })).toBe(
      "3 chapters downloaded · 2 failed",
    );
    expect(endStatus({ done: 0, failed: 1 })).toBe("1 failed");
  });
});
