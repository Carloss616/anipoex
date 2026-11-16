import type { ObservableParam } from "@legendapp/state";
import { installs$ } from "@/features/extensions/state/installs";
import { exclusions$, pins$ } from "@/features/manga/state/exclusions";
import { manualMatches$ } from "@/features/manga/state/manual-matches";
import { probes$ } from "@/features/manga/state/probes";
import { searchHistory$ } from "@/features/manga/state/search-history";
import { source$ } from "@/features/manga/state/source";
import { settings$ } from "@/state/settings";
import { normalizeSettings } from "@/state/settings/utils/migrate";
import type { SyncTable } from "../utils/watch-table";

/** `version` and `device` stay on each device. */
const SETTINGS_LOCAL = new Set(["version", "device"]);

const table = (
  name: string,
  obs$: ObservableParam,
  depth: number,
  options?: Pick<SyncTable, "synced" | "normalize" | "local" | "localYields">,
): SyncTable => ({ name, obs$, depth, ...options });

// A source can fail on one device and work on another (its runtime, network
// or DNS): what a device finds about reading it stays there, and only what
// it finds about the source itself syncs.
const field = (value: unknown, name: string) =>
  value && typeof value === "object"
    ? (value as Record<string, unknown>)[name]
    : undefined;

/** Every store that syncs; the chapter lists, cookies and session never do. */
export const TABLES: SyncTable[] = [
  table("settings", settings$, 1, {
    synced: (key) => !SETTINGS_LOCAL.has(key),
    normalize: normalizeSettings,
  }),
  // A scan's pick follows what reads here; a pick by hand beats it anywhere.
  table("matches", source$, 1, {
    local: (value) => field(value, "auto") === true,
    localYields: true,
  }),
  table("manual-matches", manualMatches$, 2),
  table("exclusions", exclusions$, 2, {
    local: (value) => field(value, "reason") === "error-found",
  }),
  table("pins", pins$, 2),
  table("probes", probes$, 2, {
    local: (value) => field(value, "errored") === true,
  }),
  table("search-history", searchHistory$, 0),
  table("extensions", installs$, 1),
];
