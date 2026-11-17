import { describe, expect, it } from "bun:test";
import { MediaListStatus } from "@/graphql/types.generated";
import { pendingWrite } from "./pending-write";

const today = new Date(2026, 10, 16);
const TODAY = { year: 2026, month: 11, day: 16 };
const AT = 1;
const entry = (progress: number, status = MediaListStatus.Current) => ({
  id: 7,
  status,
  progress,
  score: 8,
  startedAt: { year: 2026, month: 1, day: 2 },
  completedAt: null,
});
const reader = (progress: number) => ({ progress, at: AT });

describe("pendingWrite", () => {
  it("reader progress past AniList's saves with the rules", () => {
    const write = pendingWrite(
      1,
      reader(5),
      { id: 1, progress: 3, status: MediaListStatus.Current },
      20,
      today,
    );
    expect(write).toMatchObject({
      kind: "save",
      variables: { id: 1, progress: 5 },
    });
  });

  it("reader progress AniList already has is dropped", () => {
    expect(pendingWrite(1, reader(5), entry(7), 20, today)).toBeNull();
    expect(pendingWrite(1, reader(5), entry(5), 20, today)).toBeNull();
  });

  it("keeps a status set elsewhere", () => {
    const write = pendingWrite(
      1,
      reader(5),
      entry(3, MediaListStatus.Paused),
      20,
      today,
    );
    expect(write?.kind === "save" && write.variables.status).toBe(
      MediaListStatus.Paused,
    );
  });

  it("dates the start of a first chapter", () => {
    const write = pendingWrite(
      1,
      reader(1),
      { ...entry(0), startedAt: null },
      20,
      today,
    );
    expect(write?.kind === "save" && write.variables.startedAt).toEqual(TODAY);
  });

  it("completes and dates an entry at its last chapter", () => {
    expect(pendingWrite(1, reader(20), entry(18), 20, today)).toMatchObject({
      variables: {
        status: MediaListStatus.Completed,
        progress: 20,
        completedAt: TODAY,
      },
    });
  });

  it("edited fields win, untouched ones keep AniList's", () => {
    const write = pendingWrite(
      1,
      { edits: { score: 9 }, entryId: 7, at: AT },
      { id: 7, status: MediaListStatus.Paused, score: 7, progress: 10 },
      20,
      today,
    );
    expect(write).toEqual({
      kind: "save",
      variables: {
        id: 7,
        mediaId: 1,
        status: MediaListStatus.Paused,
        score: 9,
        progress: 10,
      },
    });
  });

  it("progress set by hand goes out even when lower", () => {
    const write = pendingWrite(
      1,
      { edits: { progress: 4 }, entryId: 7, at: AT },
      entry(10),
      20,
      today,
    );
    expect(write).toMatchObject({ kind: "save", variables: { progress: 4 } });
  });

  it("an edited date goes out, a cleared one as the null triple", () => {
    const write = pendingWrite(
      1,
      {
        edits: {
          startedAt: { year: null, month: null, day: null },
          completedAt: TODAY,
        },
        entryId: 7,
        at: AT,
      },
      entry(10),
      20,
      today,
    );
    expect(write).toMatchObject({
      variables: {
        startedAt: { year: null, month: null, day: null },
        completedAt: TODAY,
      },
    });
  });

  it("edits AniList already has send nothing", () => {
    const write = pendingWrite(
      1,
      { edits: { score: 8 }, entryId: 7, at: AT },
      entry(10),
      20,
      today,
    );
    expect(write).toBeNull();
  });

  it("a removal deletes the current entry", () => {
    const removal = { remove: true as const, entryId: 7, at: AT };
    expect(pendingWrite(1, removal, entry(10), 20, today)).toEqual({
      kind: "delete",
      id: 7,
    });
    expect(pendingWrite(1, removal, null, 20, today)).toBeNull();
  });

  it("an entry added offline is created", () => {
    const write = pendingWrite(
      1,
      { edits: { status: MediaListStatus.Planning }, at: AT },
      null,
      20,
      today,
    );
    expect(write).toEqual({
      kind: "save",
      variables: {
        mediaId: 1,
        status: MediaListStatus.Planning,
        progress: 0,
        score: 0,
      },
    });
  });

  it("edits to an entry removed elsewhere are dropped", () => {
    const write = pendingWrite(
      1,
      { edits: { status: MediaListStatus.Paused }, entryId: 5, at: AT },
      null,
      20,
      today,
    );
    expect(write).toBeNull();
  });
});
