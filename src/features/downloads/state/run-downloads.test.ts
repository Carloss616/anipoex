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
  downloadProgress$,
  downloadQueue$,
  downloadStops,
  downloaded$,
  downloadsPaused$,
  enqueue,
} = await import("./download-queue");
const {
  downloadDeps,
  pauseDownloads,
  resumeDownloads,
  resumeQueue,
  startDownloads,
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
let packHeld: ReturnType<typeof held<string>> | undefined;
const dropStage = mock(async (_stage: string) => {});
const put = mock(async (_path: string, _uri: string) => {});
const original = { ...downloadDeps };
Object.assign(downloadDeps, {
  runtime: {
    pages: pages.fn,
    stagePage: async () => {},
    pack: (...args: unknown[]) =>
      packHeld ? packHeld.fn(...args) : Promise.resolve("file:///x.cbz"),
    dropStage,
  },
  store: () => ({ put }),
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
  for (const call of [...pages.calls, ...(packHeld?.calls ?? [])])
    call.reject(new Error("test over"));
  await flush();
  pages.calls.length = 0;
  pages.fn.mockClear();
  packHeld = undefined;
  dropStage.mockClear();
  put.mockClear();
  downloadsPaused$.set(false);
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
    packHeld = held<string>();
    enqueue([item("a")]);
    startDownloads();
    await flush();
    pages.calls[0].resolve([page]);
    await flush();
    expect(packHeld.calls).toHaveLength(1);
    pauseDownloads();
    resumeDownloads();
    packHeld.calls[0].resolve("file:///x.cbz");
    await flush();
    expect(downloadQueue$.get()[keyOf("a")]).toBeDefined();
    expect(downloaded$.get()["21/1234"]).toBeUndefined();
    // The new run starts the chapter again once the old one is out.
    expect(urlsAsked()).toEqual(["a", "a"]);
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
});
