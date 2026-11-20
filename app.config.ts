import type { ConfigContext, ExpoConfig } from "expo/config";

// CI passes the release tag (vX.Y.Z); local builds keep app.json's version.
export default ({ config }: ConfigContext): ExpoConfig => {
  const version =
    process.env.RELEASE_TAG?.replace(/^v/, "") ?? config.version ?? "";
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(version);
  if (!match) throw new Error(`Version "${version}" isn't X.Y.Z`);
  const [major, minor, patch] = match.slice(1).map(Number);
  // X.Y.Z → XYYYZZZ, so every release installs over the one before it.
  const buildNumber = major * 1_000_000 + minor * 1_000 + patch;

  return {
    ...config,
    name: config.name ?? "anipoex",
    slug: config.slug ?? "anipoex",
    version,
    android: { ...config.android, versionCode: buildNumber },
    ios: { ...config.ios, buildNumber: String(buildNumber) },
  };
};
