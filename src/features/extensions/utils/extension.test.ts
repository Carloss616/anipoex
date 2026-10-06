import { describe, expect, it } from "bun:test";
import { countExtensions, describeVersion, hasUpdate } from "./extension";
import { ext, LIST } from "./fixtures";

describe("hasUpdate", () => {
  it("needs an installed extension with a different latest version", () => {
    expect(
      hasUpdate(ext({ id: "a", installed: true, latestVersion: "2.0.0" })),
    ).toBe(true);
    expect(
      hasUpdate(ext({ id: "a", installed: false, latestVersion: "2.0.0" })),
    ).toBe(false);
    expect(
      hasUpdate(ext({ id: "a", installed: true, latestVersion: "1.0.0" })),
    ).toBe(false);
  });
});

describe("countExtensions", () => {
  it("counts installed and pending updates", () => {
    expect(countExtensions(LIST)).toEqual({ installed: 3, updates: 2 });
  });
});

describe("describeVersion", () => {
  it("shows the jump when an update is pending", () => {
    expect(describeVersion(LIST[1])).toBe("v1.0.0 → v1.1.0");
    expect(describeVersion(LIST[0])).toBe("v1.0.0");
  });
});
