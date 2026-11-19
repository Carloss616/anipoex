import { describe, expect, it } from "bun:test";
import { pageAt } from "./page-at";

// Pages 100 tall, one after another.
const at = (scroll: number, count = 5) =>
  pageAt(
    scroll,
    count,
    (i) => i * 100,
    () => 100,
  );

describe("pageAt", () => {
  it("is page 1 at the top", () => {
    expect(at(0)).toEqual({ page: 1, offset: 0 });
  });

  it("names the page under the top edge and how far into it", () => {
    expect(at(250)).toEqual({ page: 3, offset: 0.5 });
  });

  it("rounds the offset to two decimals", () => {
    expect(at(133.333)).toEqual({ page: 2, offset: 0.33 });
  });

  it("stays on the last page past the end", () => {
    expect(at(900)).toEqual({ page: 5, offset: 0.99 });
  });
});
