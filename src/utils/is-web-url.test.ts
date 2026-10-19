import { describe, expect, it } from "bun:test";
import { isWebUrl } from "./is-web-url";

describe("isWebUrl", () => {
  it("accepts http and https in any case", () => {
    expect(isWebUrl("https://example.com/a?b=1")).toBe(true);
    expect(isWebUrl("http://example.com")).toBe(true);
    expect(isWebUrl("HTTPS://Example.com")).toBe(true);
  });

  it("rejects every other scheme and garbage", () => {
    for (const url of [
      "javascript:alert(1)",
      "intent://x",
      "file:///etc",
      "content://x",
      "example.com",
      "",
      "not a url",
    ]) {
      expect(isWebUrl(url)).toBe(false);
    }
  });
});
