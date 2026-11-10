import { describe, expect, it } from "bun:test";
import { widgetFileName } from "./widget-image";

describe("widgetFileName", () => {
  it("is stable per url and differs between urls", () => {
    const url = "https://x.test/a.png?x=1";
    expect(widgetFileName(url)).toBe(widgetFileName(url));
    expect(widgetFileName(url)).not.toBe(
      widgetFileName("https://x.test/b.png"),
    );
  });

  it("keeps the path's extension, png when none", () => {
    expect(widgetFileName("https://x.test/a.png?x=1")).toMatch(
      /^img-[0-9a-z]+\.png$/,
    );
    expect(widgetFileName("https://x.test/a.webp")).toMatch(/\.webp$/);
    expect(widgetFileName("https://x.test/cover")).toMatch(/\.png$/);
  });
});
