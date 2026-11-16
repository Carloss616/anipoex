import { describe, expect, it } from "bun:test";
import { MediaListStatus } from "@/graphql/types.generated";
import { pendingSave } from "./pending-save";

const today = new Date(2026, 10, 16);
const TODAY = { year: 2026, month: 11, day: 16 };
const entry = (progress: number, status = MediaListStatus.Current) => ({
  id: 7,
  status,
  progress,
  score: 8,
  startedAt: { year: 2026, month: 1, day: 2 },
  completedAt: null,
});

describe("pendingSave", () => {
  it("sends nothing when AniList already has as much or more", () => {
    expect(pendingSave(1, 5, entry(8), 20, today)).toBeNull();
    expect(pendingSave(1, 5, entry(5), 20, today)).toBeNull();
  });

  it("sends nothing for an entry no longer in the list", () => {
    expect(pendingSave(1, 5, null, 20, today)).toBeNull();
  });

  it("raises the fresh entry's progress and keeps its other fields", () => {
    expect(pendingSave(1, 5, entry(3), 20, today)).toEqual({
      id: 7,
      mediaId: 1,
      status: MediaListStatus.Current,
      progress: 5,
      score: 8,
    });
  });

  it("keeps a status set elsewhere", () => {
    expect(
      pendingSave(1, 5, entry(3, MediaListStatus.Paused), 20, today)?.status,
    ).toBe(MediaListStatus.Paused);
  });

  it("dates the start of a first chapter", () => {
    const save = pendingSave(1, 1, { ...entry(0), startedAt: null }, 20, today);
    expect(save?.startedAt).toEqual(TODAY);
  });

  it("completes and dates an entry at its last chapter", () => {
    expect(pendingSave(1, 20, entry(18), 20, today)).toMatchObject({
      status: MediaListStatus.Completed,
      progress: 20,
      completedAt: TODAY,
    });
  });
});
