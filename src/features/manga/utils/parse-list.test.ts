import { describe, expect, it } from "bun:test";
import { MediaListStatus } from "@/graphql/types.generated";
import { parseList } from "./parse-list";

describe("parseList", () => {
  it("reads a known status", () => {
    expect(parseList("PLANNING")).toBe(MediaListStatus.Planning);
  });

  it("opens Reading for anything else", () => {
    for (const junk of [
      undefined,
      "",
      "foo",
      "planning",
      "toString",
      "__proto__",
    ]) {
      expect(parseList(junk)).toBe(MediaListStatus.Current);
    }
  });

  it("takes the first of a repeated param", () => {
    expect(parseList(["PAUSED", "DROPPED"])).toBe(MediaListStatus.Paused);
  });
});
