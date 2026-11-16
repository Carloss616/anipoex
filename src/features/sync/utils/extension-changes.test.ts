import { describe, expect, it } from "bun:test";
import { extensionChanges } from "./extension-changes";

const none = () => false;

describe("extensionChanges", () => {
  it("installs what another device added", () => {
    expect(extensionChanges(["a"], { a: {}, b: {} }, {}, none)).toEqual({
      add: ["b"],
      remove: [],
    });
  });

  it("uninstalls only what was removed, not what isn't listed yet", () => {
    const stamps = { gone: { updatedAt: 1, deletedAt: 2 } };
    expect(extensionChanges(["gone", "new"], {}, stamps, none)).toEqual({
      add: [],
      remove: ["gone"],
    });
  });

  it("leaves alone what is busy or failed", () => {
    const stamps = { gone: { updatedAt: 1, deletedAt: 2 } };
    const skip = (pkg: string) => pkg !== "ok";
    expect(extensionChanges(["gone"], { b: {}, ok: {} }, stamps, skip)).toEqual(
      { add: ["ok"], remove: [] },
    );
  });
});
