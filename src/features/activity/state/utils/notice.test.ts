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
  const setup = (announced = false) => {
    const shown: string[] = [];
    let taken = 0;
    const change = debounceNotice(
      () => {
        taken++;
        return announced;
      },
      (text) => shown.push(text),
      20,
    );
    return { shown, change, taken: () => taken };
  };

  it("ignores the first value", async () => {
    const { shown, change } = setup();
    change(true, 0);
    await wait(40);
    expect(shown).toEqual([]);
  });

  it("shows nothing for a flap shorter than the delay", async () => {
    const { shown, change, taken } = setup();
    change(true, 0);
    change(false, 0);
    await wait(5);
    change(true, 0);
    await wait(40);
    expect(shown).toEqual([]);
    expect(taken()).toBe(1);
  });

  it("shows a lasting offline and a lasting return", async () => {
    const { shown, change } = setup();
    change(true, 0);
    change(false, 0);
    await wait(40);
    change(true, 0);
    await wait(40);
    expect(shown).toEqual([
      "You're offline · Changes stay on this device",
      "Back online",
    ]);
  });

  it("stays quiet offline when a toast already said so", async () => {
    const { shown, change } = setup(true);
    change(true, 0);
    change(false, 0);
    await wait(40);
    expect(shown).toEqual([]);
  });

  it("uses the pending count from the change", async () => {
    const { shown, change } = setup();
    change(false, 0);
    change(true, 2);
    await wait(40);
    expect(shown).toEqual(["Back online · Sending 2 changes"]);
  });
});
