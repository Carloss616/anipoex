import { describe, expect, it } from "bun:test";
import { MediaListStatus } from "@/graphql/types.generated";
import { formatDate } from "@/utils/utils";
import {
  describeChanges,
  setProgress,
  setStatus,
  type TrackingForm,
  toSaveVariables,
  toTrackingForm,
} from "./tracking-form";

const TODAY = new Date(2025, 5, 10);

const form = (over: Partial<TrackingForm> = {}): TrackingForm => ({
  status: MediaListStatus.Current,
  progress: 10,
  score: 0,
  startedAt: undefined,
  completedAt: undefined,
  ...over,
});

describe("toTrackingForm", () => {
  it("defaults an untracked manga to planning at zero", () => {
    expect(toTrackingForm(null)).toEqual(
      form({
        status: MediaListStatus.Planning,
        progress: 0,
        score: 0,
      }),
    );
  });

  it("reads the entry, converting the fuzzy dates", () => {
    const result = toTrackingForm({
      status: MediaListStatus.Completed,
      progress: 245,
      score: 8.5,
      startedAt: { year: 2025, month: 3, day: 4 },
      completedAt: null,
    });

    expect(result.status).toBe(MediaListStatus.Completed);
    expect(result.progress).toBe(245);
    expect(result.score).toBe(8.5);
    expect(result.startedAt?.getFullYear()).toBe(2025);
    expect(result.completedAt).toBeUndefined();
  });
});

describe("setStatus", () => {
  it("fills progress and the finish date when completing", () => {
    const result = setStatus(form(), MediaListStatus.Completed, 245, TODAY);

    expect(result.progress).toBe(245);
    expect(result.completedAt).toEqual(TODAY);
  });

  it("keeps a finish date the user already picked", () => {
    const picked = new Date(2024, 0, 2);
    const result = setStatus(
      form({ completedAt: picked }),
      MediaListStatus.Completed,
      245,
      TODAY,
    );

    expect(result.completedAt).toEqual(picked);
  });

  it("drops the finish date when the entry leaves Completed", () => {
    const result = setStatus(
      form({ status: MediaListStatus.Completed, completedAt: TODAY }),
      MediaListStatus.Current,
      245,
      TODAY,
    );

    expect(result.completedAt).toBeUndefined();
  });

  it("keeps the finish date between two unfinished statuses", () => {
    const picked = new Date(2024, 0, 2);
    const result = setStatus(
      form({ status: MediaListStatus.Paused, completedAt: picked }),
      MediaListStatus.Dropped,
      245,
      TODAY,
    );

    expect(result.completedAt).toEqual(picked);
  });

  it("leaves progress alone when the chapter count is unknown", () => {
    const result = setStatus(form(), MediaListStatus.Completed, null, TODAY);

    expect(result.progress).toBe(10);
  });

  it("stamps the start date when reading begins", () => {
    const result = setStatus(
      form({ status: MediaListStatus.Planning, progress: 0 }),
      MediaListStatus.Current,
      245,
      TODAY,
    );

    expect(result.startedAt).toEqual(TODAY);
  });
});

describe("setProgress", () => {
  it("clamps to the chapter count", () => {
    expect(setProgress(form(), 900, 245, TODAY).progress).toBe(245);
  });

  it("clamps to zero", () => {
    expect(setProgress(form(), -3, 245, TODAY).progress).toBe(0);
  });

  it("accepts any count when the total is unknown", () => {
    expect(setProgress(form(), 900, null, TODAY).progress).toBe(900);
  });

  it("stamps the start date on the first chapter", () => {
    const result = setProgress(form({ progress: 0 }), 1, 245, TODAY);

    expect(result.startedAt).toEqual(TODAY);
  });

  it("invents no start date once reading is already under way", () => {
    const result = setProgress(form({ progress: 40 }), 41, 245, TODAY);

    expect(result.startedAt).toBeUndefined();
  });

  it("invents no start date when the last chapter completes the entry", () => {
    const result = setProgress(form({ progress: 244 }), 245, 245, TODAY);

    expect(result.startedAt).toBeUndefined();
    expect(result.completedAt).toEqual(TODAY);
  });

  it("completes the entry when progress reaches the total", () => {
    const result = setProgress(form(), 245, 245, TODAY);

    expect(result.status).toBe(MediaListStatus.Completed);
    expect(result.completedAt).toEqual(TODAY);
  });

  it("does not complete an entry the user dropped", () => {
    const result = setProgress(
      form({ status: MediaListStatus.Dropped }),
      245,
      245,
      TODAY,
    );

    expect(result.status).toBe(MediaListStatus.Dropped);
  });
});

describe("toSaveVariables", () => {
  it("sends the entry id when updating", () => {
    expect(
      toSaveVariables(form({ score: 8.5 }), { mediaId: 30002, entryId: 77 }),
    ).toEqual({
      id: 77,
      mediaId: 30002,
      status: MediaListStatus.Current,
      progress: 10,
      score: 8.5,
      startedAt: { year: null, month: null, day: null },
      completedAt: { year: null, month: null, day: null },
    });
  });

  it("omits the id when creating", () => {
    const variables = toSaveVariables(form(), { mediaId: 30002 });

    expect(variables.id).toBeUndefined();
    expect(variables.mediaId).toBe(30002);
  });
});

describe("describeChanges", () => {
  const TODAY_LABEL = formatDate(TODAY);

  it("lists everything completing an entry fills in", () => {
    const before = form({ status: MediaListStatus.Planning, progress: 0 });
    const after = setStatus(before, MediaListStatus.Completed, 245, TODAY);

    expect(describeChanges(before, after, "status", 245)).toEqual([
      "Progress \u2192 245/245",
      `Start date \u2192 ${TODAY_LABEL}`,
      `Finish date \u2192 ${TODAY_LABEL}`,
    ]);
  });

  it("announces the finish date it takes back", () => {
    const before = form({
      status: MediaListStatus.Completed,
      startedAt: TODAY,
      completedAt: TODAY,
    });
    const after = setStatus(before, MediaListStatus.Current, 245, TODAY);

    expect(describeChanges(before, after, "status", 245)).toEqual([
      "Finish date cleared",
    ]);
  });

  it("announces the status the last chapter rolls into", () => {
    const before = form({ status: MediaListStatus.Current, progress: 244 });
    const after = setProgress(before, 245, 245, TODAY);

    expect(describeChanges(before, after, "progress", 245)).toEqual([
      "Status \u2192 Completed",
      `Finish date \u2192 ${TODAY_LABEL}`,
    ]);
  });

  it("never repeats the field being edited", () => {
    const before = form({ status: MediaListStatus.Planning, progress: 0 });
    const after = setStatus(before, MediaListStatus.Current, 245, TODAY);

    expect(describeChanges(before, after, "status", 245)).toEqual([
      `Start date \u2192 ${TODAY_LABEL}`,
    ]);
  });

  it("says nothing when the rules do nothing", () => {
    const before = form({
      status: MediaListStatus.Paused,
      startedAt: TODAY,
    });
    const after = setStatus(before, MediaListStatus.Dropped, 245, TODAY);

    expect(describeChanges(before, after, "status", 245)).toEqual([]);
  });

  it("drops the total from progress when the source has no count", () => {
    const before = form({ status: MediaListStatus.Current, progress: 10 });
    const after = { ...before, progress: 12 };

    expect(describeChanges(before, after, "status", null)).toEqual([
      "Progress \u2192 12",
    ]);
  });
});
