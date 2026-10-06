import type { Source } from "@/features/manga/sources";

/** A source the app can install, as the registry lists it. */
export interface Extension extends Source {
  language: string;
  version: string;
  /** The registry's newest build; differs from `version` when an update is pending. */
  latestVersion?: string;
  nsfw?: boolean;
  installed: boolean;
}

export type ExtensionCounts = { installed: number; updates: number };

export function hasUpdate(e: Extension): boolean {
  return e.installed && !!e.latestVersion && e.latestVersion !== e.version;
}

export function countExtensions(extensions: Extension[]): ExtensionCounts {
  const installed = extensions.filter((e) => e.installed);
  return {
    installed: installed.length,
    updates: installed.filter(hasUpdate).length,
  };
}

export function describeVersion(e: Extension): string {
  return hasUpdate(e) ? `v${e.version} → v${e.latestVersion}` : `v${e.version}`;
}
