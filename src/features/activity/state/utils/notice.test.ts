import { describe, expect, it } from "bun:test";
import { debounceNotice, noticeText } from "./notice";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("noticeText", () => {
  it("says offline once, unless a toast already did", () => {
    expect(noticeText(false, false, 0)).toBe(
      "You're offline · Changes stay on this device",
    );
    expect(noticeText(false, true, 0)).toBeUndefined();
  });

  it("counts what is sending", () => {
    expect(noticeText(true, false, 0)).toBe("Back online");
    expect(noticeText(true, false, 1)).toBe("Back online · Sending 1 change");
    expect(noticeText(true, false, 3)).toBe("Back online · Sending 3 changes");
  });
});

describe("debounceNotice", () => {
  const setup = () => {
    const shown: string[] = [];
    const change = debounceNotice(
      (online) => (online ? "on" : "off"),
      (text) => shown.push(text),
      20,
    );
    return { shown, change };
  };

  it("ignores the first value", async () => {
    const { shown, change } = setup();
    change(true);
    await wait(40);
    expect(shown).toEqual([]);
  });

  it("shows nothing for a flap shorter than the delay", async () => {
    const { shown, change } = setup();
    change(true);
    change(false);
    await wait(5);
    change(true);
    await wait(40);
    expect(shown).toEqual(["on"]);
  });

  it("shows a change that lasts", async () => {
    const { shown, change } = setup();
    change(true);
    change(false);
    await wait(40);
    expect(shown).toEqual(["off"]);
  });
});
