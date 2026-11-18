import { afterAll, afterEach, describe, expect, it, mock } from "bun:test";
import type { SourcePage } from "@/features/extensions";

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
  downloadFraction,
  downloadProgress$,
  downloadQueue$,
  downloadStops,
  downloaded$,
  downloadsPaused$,
  downloadsSuspended$,
  enqueue,
} = await import("./download-queue");
const {
  cancelDownload,
  downloadDeps,
  pauseDownload,
  pauseDownloads,
  resumeDownload,
  resumeDownloads,
  resumeQueue,
  startDownloads,
  suspendDownloads,
  unsuspendDownloads,
} = await import("./run-downloads");
const { chapterHash, downloadKey, stageId } = await import("../utils/paths");

interface Held<T> {
  args: unknown[];
  resolve(value: T): void;
  reject(error: unknown): void;
}
function held<T>() {
  const calls: Held<T>[] = [];
  const fn = mock(
    (...args: unknown[]) =>
      new Promise<T>((resolve, reject) =>
        calls.push({ args, resolve, reject }),
      ),
  );
  return { fn, calls };
}

const page: SourcePage = {
  index: 0,
  imageUrl: "https://example.com/p",
  headers: {},
};
const pages = held<SourcePage[]>();
let putHeld: ReturnType<typeof held<void>> | undefined;
const dropStage = mock(async (_stage: string) => {});
const put = mock(async (_path: string, _uri: string) => {});
const original = { ...downloadDeps };
Object.assign(downloadDeps, {
  runtime: {
    pages: pages.fn,
    stagePage: async () => {},
    pack: async () => "file:///x.cbz",
    dropStage,
  },
  store: () => ({
    put: (...args: [string, string]) =>
      putHeld ? putHeld.fn(...args) : put(...args),
  }),
});

const flush = () => Bun.sleep(1);
const item = (url: string, sourceId = "1234") => ({
  manga: { id: 21, title: "Manga" },
  source: { id: sourceId, name: "Source A" },
  chapter: { url, name: url, number: 1, scanlator: null, memo: null },
});
const keyOf = (url: string, sourceId = "1234") =>
  downloadKey(21, sourceId, chapterHash(url));
const urlsAsked = () => pages.calls.map((c) => c.args[1]);

afterEach(async () => {
  pauseDownloads();
  for (const call of [...pages.calls, ...(putHeld?.calls ?? [])])
    call.reject(new Error("test over"));
  await flush();
  pages.calls.length = 0;
  pages.fn.mockClear();
  putHeld = undefined;
  dropStage.mockClear();
  put.mockClear();
  downloadsPaused$.set(false);
  downloadsSuspended$.set(false);
  downloadQueue$.set({});
  downloadProgress$.set({});
  downloaded$.set({});
  downloadStops.clear();
});

afterAll(() => {
  Object.assign(downloadDeps, original);
});

describe("startDownloads", () => {
  it("runs one chapter at a time per source", async () => {
    enqueue([item("a"), item("b")]);
    startDownloads();
    await flush();
    expect(urlsAsked()).toEqual(["a"]);
    expect(downloadQueue$.get()[keyOf("a")].state).toBe("running");
    pages.calls[0].resolve([page]);
    await flush();
    expect(urlsAsked()).toEqual(["a", "b"]);
  });

  it("runs sources in parallel", async () => {
    enqueue([item("a", "1"), item("b", "2")]);
    startDownloads();
    await flush();
    expect(urlsAsked()).toEqual(["a", "b"]);
  });

  it("removes a done chapter and marks it downloaded", async () => {
    enqueue([item("a")]);
    startDownloads();
    await flush();
    pages.calls[0].resolve([page]);
    await flush();
    expect(put).toHaveBeenCalledTimes(1);
    expect(downloadQueue$.get()[keyOf("a")]).toBeUndefined();
    expect(downloaded$.get()["21/1234"][chapterHash("a")]).toBe("local");
    expect(downloadProgress$.get()[keyOf("a")]).toBeUndefined();
    expect(downloadStops.size).toBe(0);
  });

  it("marks a failed chapter and goes on with the next", async () => {
    enqueue([item("a"), item("b")]);
    startDownloads();
    await flush();
    pages.calls[0].reject(new Error("boom"));
    await flush();
    expect(downloadQueue$.get()[keyOf("a")]).toMatchObject({
      state: "failed",
      error: "boom",
    });
    expect(urlsAsked()).toEqual(["a", "b"]);
  });

  it("does nothing while paused", async () => {
    enqueue([item("a")]);
    downloadsPaused$.set(true);
    startDownloads();
    await flush();
    expect(pages.fn).not.toHaveBeenCalled();
  });
});

describe("pauseDownloads", () => {
  it("puts a running chapter back in the queue", async () => {
    enqueue([item("a")]);
    startDownloads();
    await flush();
    pauseDownloads();
    expect(downloadQueue$.get()[keyOf("a")].state).toBe("queued");
    expect(downloadsPaused$.get()).toBe(true);
  });

  it("drops the old run's writes after a pause and resume", async () => {
    putHeld = held<void>();
    enqueue([item("a")]);
    startDownloads();
    await flush();
    pages.calls[0].resolve([page]);
    await flush();
    expect(putHeld.calls).toHaveLength(1);
    pauseDownloads();
    resumeDownloads();
    putHeld.calls[0].resolve();
    await flush();
    expect(downloadQueue$.get()[keyOf("a")]).toBeDefined();
    expect(downloaded$.get()["21/1234"]).toBeUndefined();
    // The new run starts the chapter again once the old one dropped its stage.
    expect(urlsAsked()).toEqual(["a", "a"]);
    expect(dropStage.mock.invocationCallOrder[0]).toBeLessThan(
      pages.fn.mock.invocationCallOrder[1],
    );
  });
});

describe("resumeDownloads", () => {
  it("clears the user's pause and starts again", async () => {
    enqueue([item("a")]);
    pauseDownloads();
    startDownloads();
    await flush();
    expect(pages.fn).not.toHaveBeenCalled();
    resumeDownloads();
    await flush();
    expect(downloadsPaused$.get()).toBe(false);
    expect(urlsAsked()).toEqual(["a"]);
  });
});

describe("suspendDownloads", () => {
  it("stops the run without the user's pause", async () => {
    enqueue([item("a")]);
    startDownloads();
    await flush();
    suspendDownloads();
    expect(downloadQueue$.get()[keyOf("a")].state).toBe("queued");
    expect(downloadsSuspended$.get()).toBe(true);
    expect(downloadsPaused$.get()).toBe(false);
    startDownloads();
    await flush();
    expect(urlsAsked()).toEqual(["a"]);
  });

  it("starts again once over", async () => {
    enqueue([item("a")]);
    suspendDownloads();
    unsuspendDownloads();
    await flush();
    expect(downloadsSuspended$.get()).toBe(false);
    expect(urlsAsked()).toEqual(["a"]);
  });

  it("leaves a user's pause in place once over", async () => {
    enqueue([item("a")]);
    pauseDownloads();
    suspendDownloads();
    unsuspendDownloads();
    await flush();
    expect(downloadsPaused$.get()).toBe(true);
    expect(pages.fn).not.toHaveBeenCalled();
  });
});

describe("resumeQueue", () => {
  it("requeues running chapters and drops their staging", async () => {
    enqueue([item("a")]);
    downloadQueue$[keyOf("a")].state.set("running");
    await resumeQueue();
    expect(downloadQueue$.get()[keyOf("a")].state).toBe("queued");
    expect(dropStage).toHaveBeenCalledWith(stageId(keyOf("a")));
  });

  it("leaves the queue alone while downloads run", async () => {
    enqueue([item("a")]);
    startDownloads();
    await flush();
    await resumeQueue();
    expect(downloadQueue$.get()[keyOf("a")].state).toBe("running");
    expect(dropStage).not.toHaveBeenCalled();
  });
});

describe("pauseDownload", () => {
  const four = [0, 1, 2, 3].map((index) => ({ ...page, index }));

  /** Runs chapter "a" with held page stages, pauses it after two pages. */
  async function pausedAfterTwo() {
    const stages = held<void>();
    Object.assign(downloadDeps.runtime, { stagePage: stages.fn });
    enqueue([item("a")]);
    startDownloads();
    await flush();
    pages.calls[0].resolve(four);
    await flush();
    stages.calls[0].resolve();
    await flush();
    pauseDownload(keyOf("a"));
    // The page in flight still lands before the run stops.
    stages.calls[1].resolve();
    await flush();
    return stages;
  }

  afterEach(() => {
    // A paused chapter's staged pages outlive the queue reset otherwise.
    cancelDownload(keyOf("a"));
    Object.assign(downloadDeps.runtime, { stagePage: async () => {} });
  });

  it("keeps the ring where it stopped and the staged pages", async () => {
    const stages = await pausedAfterTwo();
    expect(downloadQueue$.get()[keyOf("a")]).toMatchObject({
      state: "paused",
      progress: 0.25,
    });
    expect(downloadFraction(keyOf("a"))).toBe(0.25);
    expect(stages.calls).toHaveLength(2);
    expect(dropStage).not.toHaveBeenCalled();
  });

  it("resumes after the pages it staged", async () => {
    const stages = await pausedAfterTwo();
    resumeDownload(keyOf("a"));
    await flush();
    expect(downloadProgress$.get()[keyOf("a")]).toBe(0.5);
    pages.calls[1].resolve(four);
    await flush();
    expect(stages.calls[2].args[3]).toBe("003");
    for (const call of stages.calls.slice(2)) call.reject(new Error("over"));
  });

  it("drops a paused chapter's stage when it is cancelled", async () => {
    await pausedAfterTwo();
    cancelDownload(keyOf("a"));
    await flush();
    expect(downloadQueue$.get()[keyOf("a")]).toBeUndefined();
    expect(dropStage).toHaveBeenCalledWith(stageId(keyOf("a")));
  });
});
