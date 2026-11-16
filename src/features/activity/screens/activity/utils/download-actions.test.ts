import { describe, expect, mock, test } from "bun:test";

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

const { pauseDownloads, resumeDownloads, retryAllDownloads } = await import(
  "@/features/downloads"
);
const { downloadActions } = await import("./download-actions");

const labels = (...args: Parameters<typeof downloadActions>) =>
  downloadActions(...args).map((a) => a.label);

describe("downloadActions", () => {
  test("offers Retry all only when one failed", () => {
    expect(labels(false, true, false)).toEqual(["Pause"]);
    expect(labels(false, false, true)).toEqual(["Retry all"]);
    expect(labels(false, true, true)).toEqual(["Retry all", "Pause"]);
    expect(labels(false, false, false)).toEqual([]);
  });

  test("Resume while paused, whatever is pending", () => {
    expect(labels(true, false, false)).toEqual(["Resume"]);
  });

  test("each label runs its action", () => {
    const [retry, pause] = downloadActions(false, true, true);
    expect(retry.onPress).toBe(retryAllDownloads);
    expect(pause.onPress).toBe(pauseDownloads);
    expect(downloadActions(true, false, false)[0].onPress).toBe(
      resumeDownloads,
    );
  });
});
