import { beforeEach, describe, expect, test } from "bun:test";
import type { ConfigContext } from "expo/config";
import appConfig from "./app.config";

const context = {
  config: { name: "anipoex", slug: "anipoex", version: "0.1.0" },
} as ConfigContext;

beforeEach(() => {
  delete process.env.RELEASE_TAG;
});

describe("app config version", () => {
  test("keeps app.json's version without a release tag", () => {
    const config = appConfig(context);
    expect(config.version).toBe("0.1.0");
    expect(config.android?.versionCode).toBe(1_000);
  });

  test("takes the version and build number from the release tag", () => {
    process.env.RELEASE_TAG = "v1.12.3";
    const config = appConfig(context);
    expect(config.version).toBe("1.12.3");
    expect(config.android?.versionCode).toBe(1_012_003);
    expect(config.ios?.buildNumber).toBe("1012003");
  });

  test("orders build numbers like the versions", () => {
    const code = (tag: string) => {
      process.env.RELEASE_TAG = tag;
      return appConfig(context).android?.versionCode ?? 0;
    };
    expect(code("v0.9.999")).toBeLessThan(code("v0.10.0"));
    expect(code("v0.999.0")).toBeLessThan(code("v1.0.0"));
  });

  test("rejects a tag that isn't X.Y.Z", () => {
    for (const tag of ["v1.2", "v1.2.3-beta.1", "v1.2.1000", "latest"]) {
      process.env.RELEASE_TAG = tag;
      expect(() => appConfig(context)).toThrow();
    }
  });
});
