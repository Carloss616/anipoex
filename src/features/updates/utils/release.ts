import { REPO } from "../constants";

/** A release this build can update to. */
export interface Update {
  version: string;
  /** The release notes, in Markdown. */
  notes: string;
  /** The release's page on GitHub. */
  url: string;
  apkUrl: string;
  /** In bytes. */
  apkSize: number;
}

/** The fields of GitHub's release object the app reads. */
export interface GitHubRelease {
  tag_name: string;
  body: string | null;
  html_url: string;
  draft: boolean;
  prerelease: boolean;
  assets: { name: string; browser_download_url: string; size: number }[];
}

const parts = (version: string) =>
  /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version)?.slice(1).map(Number);

/** Whether `version` comes after `current`; one that isn't X.Y.Z never does. */
export function isNewer(version: string, current: string) {
  const next = parts(version);
  const now = parts(current);
  if (!next || !now) return false;
  const i = next.findIndex((part, j) => part !== now[j]);
  return i >= 0 && next[i] > now[i];
}

/**
 * The update a release offers: none while it's a prerelease or isn't newer,
 * nor while CI is still uploading its APK.
 */
export function updateFrom(
  release: GitHubRelease,
  current: string,
): Update | undefined {
  const apk = release.assets.find((asset) => asset.name.endsWith(".apk"));
  if (release.draft || release.prerelease || !apk) return;
  if (!isNewer(release.tag_name, current)) return;
  return {
    version: release.tag_name.replace(/^v/, ""),
    notes: release.body ?? "",
    url: release.html_url,
    apkUrl: apk.browser_download_url,
    apkSize: apk.size,
  };
}

/**
 * The update the latest release offers over `current`, if any. GitHub's
 * `latest` leaves out drafts and prereleases, as Mihon reads it.
 *
 * @see https://github.com/mihonapp/mihon/blob/main/domain/src/main/java/tachiyomi/domain/release/interactor/GetApplicationRelease.kt
 */
export async function fetchUpdate(current: string) {
  const response = await fetch(
    `https://api.github.com/repos/${REPO}/releases/latest`,
    { headers: { Accept: "application/vnd.github+json" } },
  );
  // No release published yet.
  if (response.status === 404) return;
  if (!response.ok) throw new Error(`GitHub answered ${response.status}`);
  const release = (await response.json()) as GitHubRelease;
  if (typeof release?.tag_name !== "string" || !Array.isArray(release.assets))
    throw new Error("GitHub sent an unexpected release");
  return updateFrom(release, current);
}
