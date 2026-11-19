import { describe, expect, test } from "bun:test";
import { MediaListStatus } from "@/graphql/types.generated";
import { pendingSummary, remoteProgress } from "./summary";

describe("remoteProgress", () => {
  const before = {
    entryId: 1,
    status: null,
    progress: 45,
    score: null,
    startedAt: null,
    completedAt: null,
  };

  test("a hand-set progress compares with what AniList had", () => {
    const edits = { progress: 47 };
    expect(remoteProgress({ edits, before, at: 1 }, 47)).toBe(45);
    const none = { ...before, progress: null };
    expect(remoteProgress({ edits, before: none, at: 1 }, 47)).toBeUndefined();
  });

  test("the reader's progress compares with the cache", () => {
    expect(remoteProgress({ progress: 47, at: 1 }, 45)).toBe(45);
  });
});

describe("pendingSummary", () => {
  test("the reader's progress against what AniList has", () => {
    expect(pendingSummary({ progress: 47, at: 1 }, 45)).toBe("Chapter 45 → 47");
    expect(pendingSummary({ progress: 47, at: 1 })).toBe("Chapter 47");
  });

  test("fields edited by hand", () => {
    const edits = { status: MediaListStatus.Completed, score: 8 };
    expect(pendingSummary({ edits, entryId: 1, at: 1 })).toBe(
      "Completed · Score 8",
    );
  });

  test("a removal", () => {
    expect(pendingSummary({ remove: true, entryId: 1, at: 1 })).toBe(
      "Removed from list",
    );
  });

  test("an entry added offline", () => {
    const edits = { status: MediaListStatus.Planning };
    expect(pendingSummary({ edits, at: 1 })).toBe("Added to list · Planning");
  });

  test("dates", () => {
    const edits = { startedAt: { year: 2024 }, completedAt: { year: 2025 } };
    expect(pendingSummary({ edits, entryId: 1, at: 1 })).toBe(
      "Start date · Finish date",
    );
  });
});
