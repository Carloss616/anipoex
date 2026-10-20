import { describe, expect, it } from "bun:test";
import { MediaListStatus } from "@/graphql/types.generated";
import { formatDate } from "@/utils/utils";
import { readingSave } from "./reading-save";

const TODAY = new Date(2026, 9, 19);
const DAY = formatDate(TODAY);
const entry = (over = {}) => ({
  status: MediaListStatus.Current,
  progress: 12,
  ...over,
});

describe("readingSave", () => {
  it("raises progress of a listed entry", () => {
    const save = readingSave(entry(), 13, 48, TODAY);
    expect(save?.changes).toEqual(["Progress → 13/48"]);
    expect(save?.listed).toBe(true);
  });

  it("stamps the start date at the first chapter", () => {
    const save = readingSave(entry({ progress: 0 }), 1, 48, TODAY);
    expect(save?.changes).toContain(`Start date → ${DAY}`);
  });

  it("completes on the last chapter, in sheet order", () => {
    expect(
      readingSave(entry({ progress: 47 }), 48, 48, TODAY)?.changes,
    ).toEqual([
      "Status → Completed",
      "Progress → 48/48",
      `Finish date → ${DAY}`,
    ]);
  });

  it("keeps a paused status", () => {
    const save = readingSave(
      entry({ status: MediaListStatus.Paused, progress: 47 }),
      48,
      48,
      TODAY,
    );
    expect(save?.changes.some((c) => c.startsWith("Status"))).toBe(false);
  });

  it("never lowers or repeats progress", () => {
    expect(readingSave(entry({ progress: 13 }), 13, 48, TODAY)).toBeNull();
    expect(readingSave(entry(), 12.5, 48, TODAY)).toBeNull();
    expect(readingSave(entry(), -1, 48, TODAY)).toBeNull();
  });

  it("changes nothing past the total of a completed entry", () => {
    const save = readingSave(
      entry({ status: MediaListStatus.Completed, progress: 48 }),
      49,
      48,
      TODAY,
    );
    expect(save?.changes).toEqual([]);
  });

  it("adds an unlisted manga as Reading", () => {
    const save = readingSave(null, 1, 62, TODAY);
    expect(save?.changes).toEqual([
      "Status → Reading",
      "Progress → 1/62",
      `Start date → ${DAY}`,
    ]);
    expect(save?.listed).toBe(false);
  });

  it("adds an unlisted manga at its last chapter as Completed", () => {
    expect(readingSave(null, 48, 48, TODAY)?.changes).toEqual([
      "Status → Completed",
      "Progress → 48/48",
      `Start date → ${DAY}`,
      `Finish date → ${DAY}`,
    ]);
  });
});
