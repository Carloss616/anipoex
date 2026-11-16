import { describe, expect, it } from "bun:test";
import { MediaListStatus } from "@/graphql/types.generated";
import { pendingSave } from "./pending-save";

const today = new Date(2026, 10, 16);
const TODAY = { year: 2026, month: 11, day: 16 };
const entry = (progress: number) => ({
  id: 7,
  status: MediaListStatus.Current,
  progress,
  score: 8,
  startedAt: { year: 2026, month: 1, day: 2 },
  completedAt: null,
});

describe("pendingSave", () => {
  it("raises the cached entry's progress and keeps its other fields", () => {
    expect(
      pendingSave(
        1,
        { progress: 5, status: MediaListStatus.Current },
        entry(3),
        20,
        today,
      ),
    ).toEqual({
      id: 7,
      mediaId: 1,
      status: MediaListStatus.Current,
      progress: 5,
      score: 8,
    });
  });

  it("dates the start of a first chapter", () => {
    const save = pendingSave(
      1,
      { progress: 1 },
      { ...entry(0), startedAt: null },
      20,
      today,
    );
    expect(save.startedAt).toEqual(TODAY);
  });

  it("completes and dates an entry at its last chapter", () => {
    const save = pendingSave(
      1,
      { progress: 20, status: MediaListStatus.Completed },
      entry(18),
      20,
      today,
    );
    expect(save).toMatchObject({
      status: MediaListStatus.Completed,
      progress: 20,
      completedAt: TODAY,
    });
  });

  it("takes the kept status over the rules", () => {
    const save = pendingSave(
      1,
      { progress: 5, status: MediaListStatus.Paused },
      entry(3),
      20,
      today,
    );
    expect(save.status).toBe(MediaListStatus.Paused);
  });

  it("sends only progress and status with no cached entry", () => {
    expect(
      pendingSave(
        1,
        { progress: 5, status: MediaListStatus.Current },
        null,
        20,
        today,
      ),
    ).toEqual({ mediaId: 1, progress: 5, status: MediaListStatus.Current });
  });
});
