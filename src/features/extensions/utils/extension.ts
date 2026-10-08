import type { Source } from "@/features/manga/sources";
import type { ExtensionFilter } from "./filters";

/** `code` is ISO 639: two letters, or `mul` for multi-language sources. */
export interface Language {
  code: string;
  name: string;
}

/** A source the app can install, as the registry lists it. */
export interface Extension extends Source {
  language: Language;
  version: string;
  /** The registry's newest build; differs from `version` when an update is pending. */
  latestVersion?: string;
  nsfw?: boolean;
  installed: boolean;
}

/** One count per filter, so a filter can't ship without one. */
export type ExtensionCounts = Record<ExtensionFilter, number>;

export function hasUpdate(e: Extension): boolean {
  return e.installed && !!e.latestVersion && e.latestVersion !== e.version;
}

export function countExtensions(extensions: Extension[]): ExtensionCounts {
  const installed = extensions.filter((e) => e.installed);
  return {
    all: extensions.length,
    installed: installed.length,
    available: extensions.length - installed.length,
    updates: installed.filter(hasUpdate).length,
  };
}

export function describeVersion(e: Extension): string {
  return hasUpdate(e) ? `v${e.version} → v${e.latestVersion}` : `v${e.version}`;
}
