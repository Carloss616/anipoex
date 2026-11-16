import { afterEach, describe, expect, it, mock } from "bun:test";
import { scanStops } from "../../../state/scan-views";
import type { SourceMark } from "./marks";
import { routeStop, stopTarget, widgetMarks } from "./widget-props";

const mark = (id: string, p: Partial<SourceMark> = {}): SourceMark => ({
  id,
  name: id,
  initials: id,
  state: "pending",
  ...p,
});

describe("widgetMarks", () => {
  it("orders, cuts and maps each icon to its file", () => {
    const marks = [
      mark("a"),
      mark("b", { state: "found", unread: 2, iconUrl: "https://x.test/b" }),
      ...Array.from({ length: 6 }, (_, i) => mark(`s${i}`)),
    ];
    const { marks: shown, more } = widgetMarks(marks, (url) =>
      url ? `file:///${url.slice(-1)}.png` : undefined,
    );
    expect(shown).toHaveLength(6);
    expect(more).toBe(2);
    expect(shown[0]).toEqual({
      uri: "file:///b.png",
      initials: "b",
      state: "found",
      unread: 2,
    });
    expect(shown[1].uri).toBeUndefined();
  });
});

describe("routeStop", () => {
  afterEach(() => {
    scanStops.delete("901");
    scanStops.delete("library");
  });

  it("runs the Stop its target names, and nothing else", () => {
    const one = mock();
    const library = mock();
    scanStops.set("901", one);
    scanStops.set("library", library);
    routeStop(stopTarget("library"));
    routeStop("other");
    routeStop(stopTarget("902"));
    expect(library).toHaveBeenCalledTimes(1);
    expect(one).not.toHaveBeenCalled();
  });
});
