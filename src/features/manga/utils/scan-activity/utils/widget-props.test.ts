import { afterEach, describe, expect, it, mock } from "bun:test";
import { scanStops } from "../../../state/scan-views";
import type { SourceMark } from "./marks";
import {
  type Clock,
  coalesce,
  routeStop,
  stopTarget,
  widgetMarks,
} from "./widget-props";

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

describe("coalesce", () => {
  const setup = () => {
    let time = 0;
    let timers: { at: number; run: () => void }[] = [];
    const clock: Clock = {
      now: () => time,
      after: (ms, run) => timers.push({ at: time + ms, run }),
    };
    const sent: [number, boolean][] = [];
    let release = () => {};
    let hold = false;
    const updates = coalesce<number>(
      (props, end) => {
        sent.push([props, end]);
        return hold
          ? new Promise<void>((resolve) => {
              release = resolve;
            })
          : Promise.resolve();
      },
      { clock },
    );
    const advance = async (ms: number) => {
      time += ms;
      const due = timers.filter((t) => t.at <= time);
      timers = timers.filter((t) => t.at > time);
      for (const t of due) t.run();
      await settle();
    };
    return {
      updates,
      sent,
      advance,
      holdSends: () => {
        hold = true;
      },
      release: async () => {
        release();
        await settle();
      },
    };
  };
  const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

  it("sends a burst as its first and last props, one per window", async () => {
    const { updates, sent, advance } = setup();
    for (let i = 1; i <= 10; i++) updates.push(i);
    await settle();
    expect(sent).toEqual([[1, false]]);
    await advance(100);
    expect(sent).toHaveLength(1);
    await advance(150);
    expect(sent).toEqual([
      [1, false],
      [10, false],
    ]);
  });

  it("sends the end at once, last, and nothing after it", async () => {
    const { updates, sent, advance } = setup();
    updates.push(1);
    await settle();
    updates.push(2);
    const ended = updates.end(3);
    updates.push(4);
    expect(updates.end(5)).toBe(ended);
    await ended;
    await advance(1000);
    expect(sent).toEqual([
      [1, false],
      [3, true],
    ]);
  });

  it("holds the end until the update in flight settles", async () => {
    const { updates, sent, holdSends, release } = setup();
    holdSends();
    updates.push(1);
    await settle();
    void updates.end(2);
    await settle();
    expect(sent).toEqual([[1, false]]);
    await release();
    expect(sent).toEqual([
      [1, false],
      [2, true],
    ]);
  });
});
