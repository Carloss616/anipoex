import { describe, expect, it } from "bun:test";
import { MediaListStatus } from "@/graphql/types.generated";
import {
  customKey,
  customName,
  listTitle,
  parseList,
  resolveList,
} from "./parse-list";

describe("parseList", () => {
  it("reads a custom list", () => {
    expect(parseList("custom:To reread")).toBe("custom:To reread");
    expect(parseList("custom:")).toBe(MediaListStatus.Current);
  });

  it("round-trips any name", () => {
    const name = "Side stories & más: 2 🌙";
    const url = new URLSearchParams({ list: customKey(name) }).toString();
    const key = parseList(new URLSearchParams(url).get("list") ?? undefined);
    expect(customName(key)).toBe(name);
    expect(listTitle(key)).toBe(name);
  });

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

describe("resolveList", () => {
  it("falls back to Reading for a list the account doesn't have", () => {
    expect(resolveList("custom:Gone", ["List A"])).toBe(
      MediaListStatus.Current,
    );
    expect(resolveList("custom:List A", ["List A"])).toBe("custom:List A");
  });

  it("keeps any key until the names load", () => {
    expect(resolveList("custom:Gone", null)).toBe("custom:Gone");
    expect(resolveList(MediaListStatus.Paused, [])).toBe(
      MediaListStatus.Paused,
    );
  });
});
