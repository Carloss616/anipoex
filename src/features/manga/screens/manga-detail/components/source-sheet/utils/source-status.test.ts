import { describe, expect, it } from "bun:test";
import type { ProviderProbe } from "@/features/manga/utils/msu";
import { sourceStatus } from "./source-status";

const probe = (over: Partial<ProviderProbe> = {}): ProviderProbe => ({
  provider: "a",
  providerName: "A",
  latest: 18,
  count: 5,
  matched: true,
  errored: false,
  updatedAt: 0,
  ...over,
});
const NOW = 10_000_000_000;
const at = (probeOver: Partial<ProviderProbe>, read = 0, sus = false) =>
  sourceStatus(probe({ updatedAt: NOW, ...probeOver }), read, 10, sus, NOW);

describe("sourceStatus", () => {
  it("not scanned", () =>
    expect(sourceStatus(undefined, 0, 10, false, NOW)).toEqual({
      label: "not scanned",
      color: "secondary",
    }));

  it("error", () => {
    const s = at({ errored: true, matched: false, count: 0, latest: 0 });
    expect([s.label, s.color]).toEqual(["error", "destructive"]);
  });

  it("no match", () => {
    const s = at({ matched: false, count: 0, latest: 0 });
    expect([s.label, s.color]).toEqual(["no match", "warning"]);
  });

  it("unread, suspicious, and zero", () => {
    expect(at({ latest: 252 }, 18)).toMatchObject({
      label: "+234",
      color: "success",
      chapter: 252,
    });
    expect(at({ latest: 252 }, 18, true)).toMatchObject({
      color: "warning",
      suspicious: true,
    });
    expect(at({ latest: 18 }, 18)).toMatchObject({
      label: "+0",
      color: "secondary",
    });
    expect(at({ latest: 5 }, 30)).toMatchObject({
      label: "+0",
      color: "warning",
    });
  });

  it("age", () => {
    const age = (ms: number) =>
      sourceStatus(probe({ updatedAt: NOW - ms }), 0, 10, false, NOW).age;
    expect(age(30_000)).toBe("now");
    expect(age(5 * 60_000)).toBe("5m");
    expect(age(2 * 3_600_000)).toBe("2h");
    expect(age(3 * 86_400_000)).toBe("3d");
  });
});
