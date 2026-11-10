import { afterEach, describe, expect, it, mock } from "bun:test";
import { scanStops } from "../../../state/scan-views";
import type { SourceMark } from "./marks";
import {
  type Clock,
  coalesce,
  limiter,
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
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  const fakeClock = () => {
    let time = 0;
    let timers: { at: number; run: () => void }[] = [];
    const clock: Clock = {
      now: () => time,
      after: (ms, run) => timers.push({ at: time + ms, run }),
    };
    const advance = async (ms: number) => {
      for (let step = 0; step < ms; step += 10) {
        time += 10;
        const due = timers.filter((t) => t.at <= time);
        timers = timers.filter((t) => t.at > time);
        for (const t of due) t.run();
        await settle();
      }
    };
    return { clock, advance };
  };
  const setup = () => {
    const { clock, advance } = fakeClock();
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
      limiter(250, clock),
    );
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

  it("sends each burst as its latest props, one per window", async () => {
    const { updates, sent, advance } = setup();
    for (let i = 1; i <= 10; i++) updates.push(i);
    await settle();
    expect(sent).toEqual([[10, false]]);
    for (let i = 11; i <= 20; i++) updates.push(i);
    await advance(240);
    expect(sent).toHaveLength(1);
    await advance(10);
    expect(sent).toEqual([
      [10, false],
      [20, false],
    ]);
  });

  it("sends the end last, an interval after the last send", async () => {
    const { updates, sent, advance } = setup();
    updates.push(1);
    await settle();
    updates.push(2);
    const ended = updates.end(3);
    updates.push(4);
    expect(updates.end(5)).toBe(ended);
    await advance(240);
    expect(sent).toEqual([[1, false]]);
    await advance(10);
    await ended;
    await advance(1000);
    expect(sent).toEqual([
      [1, false],
      [3, true],
    ]);
  });

  it("sends the end an interval after the send in flight settles", async () => {
    const { updates, sent, advance, holdSends, release } = setup();
    holdSends();
    updates.push(1);
    await settle();
    void updates.end(2);
    await advance(300);
    expect(sent).toEqual([[1, false]]);
    await release();
    expect(sent).toHaveLength(1);
    await advance(250);
    expect(sent).toEqual([
      [1, false],
      [2, true],
    ]);
  });

  it("spaces two widgets' sends through a shared limiter", async () => {
    const { clock, advance } = fakeClock();
    const limit = limiter(350, clock);
    const sent: [string, number, boolean][] = [];
    const times: number[] = [];
    const widget = (name: string) =>
      coalesce<number>((props, end) => {
        sent.push([name, props, end]);
        times.push(clock.now());
        return Promise.resolve();
      }, limit);
    const a = widget("a");
    const b = widget("b");
    a.push(1);
    b.push(1);
    a.push(2);
    const ended = b.end(2);
    await advance(2000);
    await ended;
    expect(sent).toEqual([
      ["a", 2, false],
      ["b", 2, true],
    ]);
    a.push(3);
    b.push(3);
    await advance(2000);
    expect(sent).toHaveLength(3);
    for (let i = 1; i < times.length; i++)
      expect(times[i] - times[i - 1]).toBeGreaterThanOrEqual(350);
  });
});
