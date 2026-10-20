import { describe, expect, it } from "bun:test";
import { classify, isBadKind, unreadChapters } from "./source-classify";

describe("unreadChapters", () => {
  it("floors the gap", () => expect(unreadChapters(363, 374.5)).toBe(11));
  it("is 0 on a .5 release", () => expect(unreadChapters(18, 18.5)).toBe(0));
  it("never goes negative", () => expect(unreadChapters(20, 18)).toBe(0));
});

describe("classify", () => {
  it("errored wins", () =>
    expect(classify(10, 50, 50, true, 10)).toBe("error-found"));
  it("no chapters is no match", () =>
    expect(classify(10, 0, 0, false, 10)).toBe("not-matched"));
  it("gap or more behind is outdated", () =>
    expect(classify(30, 20, 20, false, 10)).toBe("outdated"));
  it("9 behind is up to date", () =>
    expect(classify(29, 20, 20, false, 10)).toBe("up-to-date"));
  it("ahead is new", () =>
    expect(classify(18, 252, 252, false, 10)).toBe("new"));
  it("never outdated when nothing is read", () =>
    expect(classify(0, 3, 3, false, 10)).toBe("new"));
});

it("isBadKind", () => {
  expect(
    ["not-matched", "error-found", "outdated"].every((k) =>
      isBadKind(k as never),
    ),
  ).toBe(true);
  expect(isBadKind("new") || isBadKind("up-to-date")).toBe(false);
});
