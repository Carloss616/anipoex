import { expect, mock, test } from "bun:test";

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

const { sectionTitle, toHeaderActions } = await import("./section-header");

const scan = { clearQueue: () => {}, retryAllSkipped: () => {} };

test("titles carry the count where it helps", () => {
  expect(sectionTitle("downloads", 6)).toBe("Downloads · 6");
  expect(sectionTitle("entries", 3)).toBe("To send · 3");
  expect(sectionTitle("unsent", 2)).toBe("Not sent");
});

test("each header keeps today's actions", () => {
  const d = { paused: false, pending: true, failed: true };
  const headerActions = (section: Parameters<typeof toHeaderActions>[0]) =>
    toHeaderActions(section, d, scan);
  expect(headerActions("queue").map((a) => a.label)).toEqual(["Clear"]);
  expect(headerActions("queue")[0].onPress).toBe(scan.clearQueue);
  expect(headerActions("downloads").map((a) => a.label)).toEqual([
    "Retry all",
    "Pause",
  ]);
  expect(headerActions("skipped")[0].onPress).toBe(scan.retryAllSkipped);
  expect(headerActions("entries")).toEqual([]);
});
