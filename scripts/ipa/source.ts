/**
 * Prints the source (`source.json`) for a release's IPA, which SideStore and
 * AltStore read to install and update the app. The format is AltStore's, and
 * SideStore, its fork, reads the same one.
 * Usage: bun scripts/ipa/source.ts <app> <ipa> <release.json>, where
 * release.json is `gh release view <tag> --json tagName,body,publishedAt`.
 * @see https://faq.altstore.io/developers/make-a-source
 */
import { readFileSync } from "node:fs";
import { REPO, REPO_URL } from "@/features/updates/constants";

type Plist = Record<string, unknown>;

export interface Release {
  tagName: string;
  body: string;
  publishedAt: string;
}

export interface Bundle {
  info: Plist;
  entitlements: Plist;
}

/**
 * Lists every entitlement and privacy text of the app and its extensions:
 * SideStore and AltStore refuse an IPA whose own differ.
 */
export function storeSource(
  app: Bundle,
  extensions: Bundle[],
  release: Release,
  ipaSize: number,
) {
  const bundles = [app, ...extensions];
  const entitlements = [
    ...new Set(bundles.flatMap((b) => Object.keys(b.entitlements))),
  ].sort();
  const privacy = Object.fromEntries(
    bundles.flatMap((b) =>
      Object.entries(b.info).filter(([key]) =>
        key.endsWith("UsageDescription"),
      ),
    ),
  );
  const { tagName } = release;
  return {
    name: "Anipoex",
    website: REPO_URL,
    apps: [
      {
        name: "Anipoex",
        bundleIdentifier: app.info.CFBundleIdentifier,
        developerName: "Anipoex",
        localizedDescription:
          "An AniList manga tracker that compares every source for each manga and syncs privately across your devices.",
        iconURL: `https://raw.githubusercontent.com/${REPO}/main/assets/images/icon.png`,
        category: "entertainment",
        versions: [
          {
            version: app.info.CFBundleShortVersionString,
            buildVersion: app.info.CFBundleVersion,
            date: release.publishedAt,
            localizedDescription: release.body,
            downloadURL: `${REPO_URL}/releases/download/${tagName}/anipoex-${tagName}.ipa`,
            size: ipaSize,
            minOSVersion: app.info.MinimumOSVersion,
          },
        ],
        appPermissions: { entitlements, privacy },
      },
    ],
    news: [],
  };
}

function run(args: string[], stdin?: Uint8Array) {
  const done = Bun.spawnSync(args, { stdin });
  if (!done.success) throw new Error(`${args[0]} failed: ${done.stderr}`);
  return done.stdout;
}

/** Info.plist is binary and codesign prints XML: plutil reads both. */
function plistJson(plist: Uint8Array): Plist {
  if (!plist.length) return {};
  const json = run(["plutil", "-convert", "json", "-o", "-", "-"], plist);
  return JSON.parse(json.toString());
}

const readBundle = (path: string): Bundle => ({
  info: plistJson(readFileSync(`${path}/Info.plist`)),
  entitlements: plistJson(
    run(["codesign", "-d", "--entitlements", "-", "--xml", path]),
  ),
});

if (import.meta.main) {
  const [appPath, ipaPath, releasePath] = process.argv.slice(2);
  if (!appPath || !ipaPath || !releasePath)
    throw new Error("Usage: source.ts <app> <ipa> <release.json>");
  const extensions = [
    ...new Bun.Glob("PlugIns/*.appex").scanSync({
      cwd: appPath,
      onlyFiles: false,
    }),
  ].map((appex) => readBundle(`${appPath}/${appex}`));
  const source = storeSource(
    readBundle(appPath),
    extensions,
    await Bun.file(releasePath).json(),
    Bun.file(ipaPath).size,
  );
  console.log(JSON.stringify(source, null, 2));
}
