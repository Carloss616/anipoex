import { describe, expect, test } from "bun:test";
import { MediaListStatus } from "@/graphql/types.generated";
import { pendingSummary } from "./summary";

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
