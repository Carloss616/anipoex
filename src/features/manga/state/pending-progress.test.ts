import { beforeEach, describe, expect, it, mock } from "bun:test";
import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
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
  isNetworkError,
  keepPending,
  pendingProgress$,
} = await import("./pending-progress");

beforeEach(() => pendingProgress$.set({}));

describe("keepPending", () => {
  it("keeps the higher progress", () => {
    keepPending(1, { progress: 12, status: MediaListStatus.Current });
    keepPending(1, { progress: 10, status: MediaListStatus.Paused });
    expect(pendingProgress$[1].get()).toMatchObject({
      progress: 12,
      status: MediaListStatus.Current,
    });
  });

  it("takes the status of a progress that is not lower", () => {
    keepPending(1, { progress: 12, status: MediaListStatus.Current });
    keepPending(1, { progress: 14, status: MediaListStatus.Completed });
    expect(pendingProgress$[1].get()).toMatchObject({
      progress: 14,
      status: MediaListStatus.Completed,
    });
  });

  it("clears a previous error", () => {
    keepPending(1, { progress: 12 });
    pendingProgress$[1].error.set("boom");
    keepPending(1, { progress: 13 });
    expect(pendingProgress$[1].get().error).toBeUndefined();
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
});

describe("flushPending", () => {
  it("drops an entry the remote already reached, without sending", async () => {
    keepPending(1, { progress: 12 });
    const send = mock(async () => {});
    await flushPending(() => 13, send);
    expect(send).not.toHaveBeenCalled();
    expect(pendingProgress$.get()).toEqual({});
  });

  it("sends an entry ahead of the remote, then drops it", async () => {
    keepPending(1, { progress: 12 });
    const send = mock(async () => {});
    await flushPending(() => 9, send);
    expect(send).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ progress: 12 }),
    );
    expect(pendingProgress$.get()).toEqual({});
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
    expect(pendingProgress$[1].get().error).toBeUndefined();
    expect(pendingProgress$[2].get()).toBeDefined();
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
    expect(pendingProgress$[1].get().error).toBe("Denied");
    expect(pendingProgress$[2].get()).toBeUndefined();
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

describe("isNetworkError", () => {
  it("is true for a dropped connection", () => {
    expect(isNetworkError(new TypeError("Network request failed"))).toBe(true);
    expect(isNetworkError(new TypeError("Failed to fetch"))).toBe(true);
    expect(isNetworkError(new TypeError("Load failed"))).toBe(true);
    expect(isNetworkError({ networkError: new Error("x") })).toBe(true);
  });

  it("is false for an answer from the server", () => {
    expect(
      isNetworkError(
        new CombinedGraphQLErrors({ errors: [{ message: "Denied" }] }),
      ),
    ).toBe(false);
    expect(
      isNetworkError(
        new ServerError("down", {
          response: new Response("", { status: 503 }),
          bodyText: "",
        }),
      ),
    ).toBe(false);
    expect(isNetworkError(new Error("other"))).toBe(false);
    expect(isNetworkError(null)).toBe(false);
  });
});
