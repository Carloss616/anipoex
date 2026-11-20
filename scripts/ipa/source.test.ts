import { describe, expect, test } from "bun:test";
import { storeSource } from "./source";

const release = {
  tagName: "v1.2.3",
  body: "- A fix",
  publishedAt: "2026-11-20T22:00:00Z",
};

describe("storeSource", () => {
  test("lists the entitlements and privacy texts of the app and its extensions", () => {
    const app = {
      info: {
        CFBundleIdentifier: "com.anipoex.app",
        CFBundleShortVersionString: "1.2.3",
        CFBundleVersion: "1002003",
        MinimumOSVersion: "16.4",
        NSFaceIDUsageDescription: "Face ID",
      },
      entitlements: { "com.apple.security.application-groups": ["group.x"] },
    };
    const widget = {
      info: { NSCameraUsageDescription: "Camera" },
      entitlements: {
        "com.apple.security.application-groups": ["group.x"],
        "com.apple.developer.siri": true,
      },
    };

    const [entry] = storeSource(app, [widget], release, 42).apps;

    expect(entry?.appPermissions).toEqual({
      entitlements: [
        "com.apple.developer.siri",
        "com.apple.security.application-groups",
      ],
      privacy: {
        NSFaceIDUsageDescription: "Face ID",
        NSCameraUsageDescription: "Camera",
      },
    });
    expect(entry?.versions).toEqual([
      {
        version: "1.2.3",
        buildVersion: "1002003",
        date: release.publishedAt,
        localizedDescription: "- A fix",
        downloadURL:
          "https://github.com/anipoex/anipoex/releases/download/v1.2.3/anipoex-v1.2.3.ipa",
        size: 42,
        minOSVersion: "16.4",
      },
    ]);
  });
});
