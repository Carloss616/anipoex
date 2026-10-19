import { initialsOf } from "@/features/manga/sources";
import type { InstalledExtension } from "../runtime/runtime";
import type { Extension, Language } from "./extension";
import type { Repo, RepoEntry } from "./repo";

const SUPPORTED_LIBS = ["1.4", "1.6"];
const MULTI: Language = { code: "mul", name: "Multi" };

export function languageName(code: string): string {
  if (code === "all" || code === "mul") return MULTI.name;
  try {
    // Hermes may lack Intl.DisplayNames.
    return (
      new Intl.DisplayNames(["en"], { type: "language" }).of(code) ??
      code.toUpperCase()
    );
  } catch {
    return code.toUpperCase();
  }
}

function languageOf(sources: { lang: string }[]): Language {
  const codes = new Set(sources.map((s) => s.lang));
  const [code] = codes;
  if (codes.size !== 1 || code === "all" || code === "mul") return MULTI;
  return { code, name: languageName(code) };
}

type Listing = { repo: Repo; entry: RepoEntry };

/** One item per package: the installed build, matched with the repo that signed it. */
export function toExtensions(
  repos: { repo: Repo; entries: RepoEntry[] }[],
  installed: InstalledExtension[],
): Extension[] {
  const listings = new Map<string, Listing[]>();
  for (const { repo, entries } of repos) {
    for (const entry of entries) {
      if (!SUPPORTED_LIBS.includes(entry.lib)) continue;
      listings.set(entry.pkg, [
        ...(listings.get(entry.pkg) ?? []),
        { repo, entry },
      ]);
    }
  }
  const installedByPkg = new Map(installed.map((i) => [i.pkg, i]));

  const result: Extension[] = [];
  for (const [pkg, options] of listings) {
    const local = installedByPkg.get(pkg);
    const pick = local
      ? options.find((o) => o.repo.signingKey === local.signingKey)
      : options[0];
    if (local) {
      result.push(fromInstalled(local, pick));
    } else if (pick) {
      const { repo, entry } = pick;
      result.push({
        id: pkg,
        name: entry.name,
        initials: initialsOf(entry.name),
        iconUrl: entry.iconUrl,
        language: languageOf(entry.sources),
        version: entry.version,
        nsfw: entry.nsfw,
        installed: false,
        apkUrl: entry.apkUrl,
        signingKey: repo.signingKey,
        repo: repo.name,
      });
    }
  }
  // Installed but unlisted (offline, or a repo was removed).
  for (const local of installed) {
    if (!listings.has(local.pkg)) result.push(fromInstalled(local));
  }
  return result;
}

function fromInstalled(local: InstalledExtension, pick?: Listing): Extension {
  const base: Extension = {
    id: local.pkg,
    name: local.name,
    initials: initialsOf(local.name),
    language: languageOf(local.sources),
    version: local.version,
    installed: true,
    signingKey: local.signingKey,
    iconUrl: local.icon ?? undefined,
  };
  if (!pick) return base;
  const { repo, entry } = pick;
  return {
    ...base,
    nsfw: entry.nsfw,
    repo: repo.name,
    apkUrl: entry.apkUrl,
    // The local file loads offline and always exists; the repo's url may 404.
    iconUrl: base.iconUrl ?? entry.iconUrl,
    ...(entry.version !== local.version && { latestVersion: entry.version }),
  };
}
