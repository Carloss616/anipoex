import { beforeEach, describe, expect, it, mock } from "bun:test";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { MediaListStatus } from "@/graphql/types.generated";

mock.module("@/state/observable-persist", () => ({
  ObservablePersist: class {
    getTable() {
      return {};
    }
    set() {}
    deleteTable() {}
    getMetadata() {
      return {};
    }
    setMetadata() {}
    deleteMetadata() {}
  },
}));

const {
  effectiveProgress,
  flushPending,
  keepEdits,
  keepPending,
  keepRemoval,
  pendingEntries$,
  restorePending,
} = await import("./pending-entries");

const BEFORE = {
  entryId: 5,
  status: MediaListStatus.Current,
  progress: 3,
  score: 7,
  startedAt: null,
  completedAt: null,
};

beforeEach(() => pendingEntries$.set({}));

describe("keepPending", () => {
  it("keeps the cache's fields from the first change", () => {
    keepPending(1, { progress: 4 }, BEFORE);
    keepPending(1, { progress: 5 }, { ...BEFORE, progress: 4 });
    expect(pendingEntries$[1].get()?.before).toEqual(BEFORE);
  });

  it("keeps the higher progress", () => {
    keepPending(1, { progress: 12, status: MediaListStatus.Current });
    keepPending(1, { progress: 10, status: MediaListStatus.Paused });
    expect(pendingEntries$[1].get()).toMatchObject({
      progress: 12,
      status: MediaListStatus.Current,
    });
  });

  it("takes the status of a progress that is not lower", () => {
    keepPending(1, { progress: 12, status: MediaListStatus.Current });
    keepPending(1, { progress: 14, status: MediaListStatus.Completed });
    expect(pendingEntries$[1].get()).toMatchObject({
      progress: 14,
      status: MediaListStatus.Completed,
    });
  });

  it("clears a previous error", () => {
    keepPending(1, { progress: 12 });
    pendingEntries$[1].error.set("boom");
    keepPending(1, { progress: 13 });
    expect(pendingEntries$[1].get().error).toBeUndefined();
  });
});

describe("keepEdits", () => {
  it("keepEdits merges per field, later wins", () => {
    keepEdits(1, 5, { status: MediaListStatus.Paused, score: 8 });
    keepEdits(1, 5, { score: 9 });
    expect(pendingEntries$[1].get()).toMatchObject({
      entryId: 5,
      edits: { status: MediaListStatus.Paused, score: 9 },
    });
  });

  it("an entry added offline without a status gets AniList's default", () => {
    keepEdits(1, undefined, { progress: 5 });
    keepEdits(1, undefined, { score: 8 });
    expect(pendingEntries$[1].get().edits).toEqual({
      progress: 5,
      score: 8,
      status: MediaListStatus.Current,
    });
  });

  it("an edit to a listed entry gets no status", () => {
    keepEdits(1, 5, { progress: 5 });
    expect(pendingEntries$[1].get().edits).toEqual({ progress: 5 });
  });

  it("keepEdits clears the error and keeps the first before", () => {
    keepEdits(1, 5, { score: 8 }, BEFORE);
    pendingEntries$[1].error.set("boom");
    keepEdits(1, 5, { score: 9 }, { ...BEFORE, score: 8 });
    expect(pendingEntries$[1].get().error).toBeUndefined();
    expect(pendingEntries$[1].get().before).toEqual(BEFORE);
  });

  it("a hand-set progress replaces the reader's", () => {
    keepPending(1, { progress: 12 });
    keepEdits(1, 5, { progress: 4 });
    expect(pendingEntries$[1].get().progress).toBeUndefined();
    expect(pendingEntries$[1].get().edits?.progress).toBe(4);
  });

  it("the reader raises a lower hand-set progress", () => {
    keepEdits(1, 5, { progress: 4, score: 9 });
    keepPending(1, { progress: 6, status: MediaListStatus.Current });
    expect(pendingEntries$[1].get().edits).toEqual({ progress: 6, score: 9 });
    expect(pendingEntries$[1].get().progress).toBeUndefined();
    expect(pendingEntries$[1].get().status).toBeUndefined();
  });

  it("a lower reader progress leaves a hand-set progress alone", () => {
    keepEdits(1, 5, { progress: 6 });
    keepPending(1, { progress: 5, status: MediaListStatus.Current });
    expect(pendingEntries$[1].get().edits).toEqual({ progress: 6 });
    expect(pendingEntries$[1].get().progress).toBeUndefined();
    expect(pendingEntries$[1].get().status).toBeUndefined();
  });
});

describe("after a removal", () => {
  it("edits after a removal start a fresh entry", () => {
    keepEdits(1, 5, { progress: 8 }, BEFORE);
    keepRemoval(1, 5, BEFORE);
    keepEdits(1, undefined, { status: MediaListStatus.Planning });
    const pending = pendingEntries$[1].get();
    expect(pending.remove).toBeUndefined();
    expect(pending).toMatchObject({ entryId: 5, before: BEFORE });
    expect(pending.edits).toEqual({
      progress: 0,
      score: 0,
      startedAt: { year: null, month: null, day: null },
      completedAt: { year: null, month: null, day: null },
      status: MediaListStatus.Planning,
    });
  });

  it("reading after a removal keeps the entry", () => {
    keepRemoval(1, 5, BEFORE);
    keepPending(1, { progress: 4, status: MediaListStatus.Current });
    const pending = pendingEntries$[1].get();
    expect(pending.remove).toBeUndefined();
    expect(pending).toMatchObject({ progress: 4, entryId: 5, before: BEFORE });
  });
});

describe("keepRemoval", () => {
  it("a removal drops progress and edits", () => {
    keepPending(1, { progress: 12 });
    keepEdits(1, 5, { score: 9 }, BEFORE);
    keepRemoval(1, 5, { ...BEFORE, score: 9 });
    const pending = pendingEntries$[1].get();
    expect(pending).toMatchObject({ remove: true, entryId: 5, before: BEFORE });
    expect(pending.progress).toBeUndefined();
    expect(pending.edits).toBeUndefined();
  });
});

describe("restorePending", () => {
  it("removes an entry the keep created", () => {
    const kept = keepPending(1, { progress: 12 });
    restorePending(1, kept);
    expect(pendingEntries$.get()).toEqual({});
  });

  it("puts back the entry the keep replaced", () => {
    keepPending(1, { progress: 12, status: MediaListStatus.Current });
    const before = { ...pendingEntries$[1].get() };
    const kept = keepPending(1, { progress: 14 });
    restorePending(1, kept);
    expect(pendingEntries$[1].get()).toEqual(before);
  });

  it("puts back the entry a lower progress only refreshed", () => {
    keepPending(1, { progress: 12 });
    const before = { ...pendingEntries$[1].get() };
    const kept = keepPending(1, { progress: 10 });
    restorePending(1, kept);
    expect(pendingEntries$[1].get()).toEqual(before);
  });

  it("leaves a sent entry gone", () => {
    const kept = keepPending(1, { progress: 12 });
    pendingEntries$[1].delete();
    restorePending(1, kept);
    expect(pendingEntries$.get()).toEqual({});
  });

  it("leaves an entry changed since the keep", () => {
    const kept = keepPending(1, { progress: 12 });
    pendingEntries$[1].error.set("boom");
    restorePending(1, kept);
    expect(pendingEntries$[1].get().error).toBe("boom");
  });
});

describe("effectiveProgress", () => {
  it("is the higher of remote and pending", () => {
    keepPending(1, { progress: 12 });
    expect(effectiveProgress(9, 1)).toBe(12);
    expect(effectiveProgress(15, 1)).toBe(15);
    expect(effectiveProgress(null, 1)).toBe(12);
    expect(effectiveProgress(undefined, 2)).toBe(0);
    expect(effectiveProgress(7, 2)).toBe(7);
  });

  it("is 0 for a pending removal", () => {
    keepRemoval(1, 5, BEFORE);
    expect(effectiveProgress(9, 1)).toBe(0);
  });

  it("takes a hand-set progress over the higher one", () => {
    keepEdits(1, 5, { progress: 4 });
    expect(effectiveProgress(9, 1)).toBe(4);
  });
});

describe("flushPending", () => {
  it("a progress-only entry AniList already has is dropped without sending", async () => {
    keepPending(1, { progress: 12 });
    const send = mock(async () => {});
    await flushPending(() => 13, send);
    expect(send).not.toHaveBeenCalled();
    expect(pendingEntries$.get()).toEqual({});
  });

  it("a progress shown in the cache by this device is still sent", async () => {
    keepPending(1, { progress: 12 }, BEFORE);
    const send = mock(async () => {});
    await flushPending(() => 12, send);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("a record with edits survives the shortcut", async () => {
    keepPending(1, { progress: 12 });
    keepEdits(1, 5, { score: 9 });
    const send = mock(async () => {});
    await flushPending(() => 13, send);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("a removal survives the shortcut", async () => {
    keepRemoval(1, 5, BEFORE);
    const send = mock(async () => {});
    await flushPending(() => 13, send);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("a change written during the send stays for the next flush", async () => {
    const { kept } = keepPending(1, { progress: 12 });
    await flushPending(
      () => 0,
      async () => {
        keepEdits(1, 5, { score: 9 });
      },
    );
    const pending = pendingEntries$[1].get();
    expect(pending.edits).toEqual({ score: 9 });
    expect(pending.at).toBeGreaterThan(kept.at);
  });

  it("sends an entry ahead of the remote, then drops it", async () => {
    keepPending(1, { progress: 12 });
    const send = mock(async () => {});
    await flushPending(() => 9, send);
    expect(send).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ progress: 12 }),
    );
    expect(pendingEntries$.get()).toEqual({});
  });

  it("sends an entry with no remote value", async () => {
    keepPending(1, { progress: 3 });
    const send = mock(async () => {});
    await flushPending(() => undefined, send);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("keeps the entry and stops on a network error", async () => {
    keepPending(1, { progress: 12 });
    keepPending(2, { progress: 5 });
    const send = mock(async () => {
      throw new TypeError("Network request failed");
    });
    await flushPending(() => 0, send);
    expect(send).toHaveBeenCalledTimes(1);
    expect(pendingEntries$[1].get().error).toBeUndefined();
    expect(pendingEntries$[2].get()).toBeDefined();
  });

  it("records other errors and goes on", async () => {
    keepPending(1, { progress: 12 });
    keepPending(2, { progress: 5 });
    const send = mock(async (id: number) => {
      if (id === 1)
        throw new CombinedGraphQLErrors({ errors: [{ message: "Denied" }] });
    });
    await flushPending(() => 0, send);
    expect(send).toHaveBeenCalledTimes(2);
    expect(pendingEntries$[1].get().error).toBe("Denied");
    expect(pendingEntries$[2].get()).toBeUndefined();
  });

  it("keeps progress written while a send is in flight", async () => {
    keepPending(1, { progress: 12 });
    await flushPending(
      () => 0,
      async () => {
        keepPending(1, { progress: 14 });
      },
    );
    expect(pendingEntries$[1].get().progress).toBe(14);
  });

  it("records a TypeError that is not a fetch failure", async () => {
    keepPending(1, { progress: 12 });
    await flushPending(
      () => 0,
      async () => {
        throw new TypeError("undefined is not a function");
      },
    );
    expect(pendingEntries$[1].get().error).toBe("undefined is not a function");
  });

  it("leaves an entry that failed for a retry", async () => {
    keepPending(1, { progress: 12 });
    pendingEntries$[1].error.set("Denied");
    const send = mock(async () => {});
    await flushPending(() => 0, send);
    expect(send).not.toHaveBeenCalled();
    expect(pendingEntries$[1].get().error).toBe("Denied");
  });

  it("skips an entry cleared during the run, as by sign-out", async () => {
    keepPending(1, { progress: 12 });
    keepPending(2, { progress: 5 });
    const send = mock(async () => {
      pendingEntries$.set({});
    });
    await flushPending(() => 0, send);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("leaves no error record for an entry cleared during its send", async () => {
    keepPending(1, { progress: 12 });
    await flushPending(
      () => 0,
      async () => {
        pendingEntries$.set({});
        throw new CombinedGraphQLErrors({ errors: [{ message: "Denied" }] });
      },
    );
    expect(pendingEntries$.get()).toEqual({});
  });

  it("shares one run between concurrent calls", async () => {
    keepPending(1, { progress: 12 });
    const send = mock(async () => {});
    const first = flushPending(() => 0, send);
    const second = flushPending(() => 0, send);
    expect(second).toBe(first);
    await first;
    expect(send).toHaveBeenCalledTimes(1);
  });
});
