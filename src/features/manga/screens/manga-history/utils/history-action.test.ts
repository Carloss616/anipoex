import { describe, expect, test } from "bun:test";
import type { MediaListStatus } from "@/graphql/types.generated";
import { historyAction, historyKind, pendingAction } from "./history-action";

describe("historyAction", () => {
  test("a range of chapters reads plural, with an en dash", () => {
    expect(
      historyAction({ status: "read chapter", progress: "118 - 120" }),
    ).toBe("Read chapters 118 – 120");
  });

  test("one chapter stays singular", () => {
    expect(historyAction({ status: "reread chapter", progress: "54" })).toBe(
      "Reread chapter 54",
    );
  });

  test("a status with progress says where it stopped", () => {
    expect(historyAction({ status: "paused reading", progress: "31" })).toBe(
      "Paused reading at 31",
    );
  });

  test("a status alone is capitalized", () => {
    expect(historyAction({ status: "plans to read", progress: null })).toBe(
      "Plans to read",
    );
  });
});

describe("historyKind", () => {
  test("maps AniList's status text", () => {
    expect(historyKind("read chapter")).toBe("read");
    expect(historyKind("plans to read")).toBe("add");
    expect(historyKind("completed")).toBe("done");
    expect(historyKind("paused reading")).toBe("pause");
    expect(historyKind("dropped")).toBe("drop");
  });
});

describe("pendingAction", () => {
  test("names what the kept change will do", () => {
    expect(pendingAction({ at: 0, entryId: 1, remove: true })).toBe(
      "Remove from your list",
    );
    expect(pendingAction({ at: 0, entryId: 1, progress: 12 })).toBe(
      "Read chapter 12",
    );
    expect(pendingAction({ at: 0, entryId: 1, edits: { progress: 3 } })).toBe(
      "Progress 3",
    );
    expect(pendingAction({ at: 0, entryId: 1, edits: { score: 8 } })).toBe(
      "Edit entry",
    );
    expect(
      pendingAction({
        at: 0,
        edits: { status: "PLANNING" as MediaListStatus },
      }),
    ).toBe("Add to your list");
  });
});
