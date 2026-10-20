import { describe, expect, it, mock } from "bun:test";

const pending: ((value: { chapters: [] }) => void)[] = [];
const chapters = mock(
  (_sourceId: string, _url: string, _title: string) =>
    new Promise<{ chapters: [] }>((resolve) => pending.push(resolve)),
);

mock.module("@/features/extensions", () => ({ runtime: { chapters } }));

const { fetchChapters } = await import("./fetch-chapters");

describe("fetchChapters", () => {
  it("shares a call in flight for the same manga, and calls again once it settles", async () => {
    const first = fetchChapters("1", "/m", "M");
    const second = fetchChapters("1", "/m", "M");
    const other = fetchChapters("1", "/n", "N");
    expect(chapters).toHaveBeenCalledTimes(2);
    expect(second).toBe(first);

    for (const resolve of pending.splice(0)) resolve({ chapters: [] });
    await Promise.all([first, other]);
    const again = fetchChapters("1", "/m", "M");
    expect(chapters).toHaveBeenCalledTimes(3);
    // Settle it, so its 30 s timeout is cleared instead of rejecting after the test.
    for (const resolve of pending.splice(0)) resolve({ chapters: [] });
    await again;
  });

  it("a load that never answers is evicted after the timeout", async () => {
    chapters.mockClear();
    const hung = fetchChapters("2", "/h", "H", 20);
    const outcome = await Promise.race([
      hung.then(
        () => "settled",
        () => "rejected",
      ),
      new Promise((resolve) => setTimeout(() => resolve("hung"), 200)),
    ]);
    expect(outcome).toBe("rejected");
    fetchChapters("2", "/h", "H", 20).catch(() => {});
    expect(chapters).toHaveBeenCalledTimes(2);
  });
});
