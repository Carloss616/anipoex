import { describe, expect, it } from "bun:test";
import { readCache } from "./utils";

describe("readCache", () => {
  it("reads a file again only when its version changes", async () => {
    const cache = readCache();
    let loads = 0;
    const load = (text: string) => async () => {
      loads++;
      return text;
    };

    cache.list([{ name: "a.json", version: "1:10" }]);
    expect(await cache.read("a.json", load("one"))).toBe("one");
    cache.list([{ name: "a.json", version: "1:10" }]);
    expect(await cache.read("a.json", load("ignored"))).toBe("one");
    cache.list([{ name: "a.json", version: "2:12" }]);
    expect(await cache.read("a.json", load("two"))).toBe("two");

    expect(loads).toBe(2);
  });

  it("forgets a file that left the folder", async () => {
    const cache = readCache();
    cache.list([{ name: "a.json", version: "1:10" }]);
    await cache.read("a.json", async () => "one");

    cache.list([]);
    cache.list([{ name: "a.json", version: "1:10" }]);

    expect(await cache.read("a.json", async () => "back")).toBe("back");
  });
});
