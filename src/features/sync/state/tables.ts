import type { ObservableParam } from "@legendapp/state";
import { exclusions$, pins$ } from "@/features/manga/state/exclusions";
import { manualMatches$ } from "@/features/manga/state/manual-matches";
import { probes$ } from "@/features/manga/state/probes";
import { searchHistory$ } from "@/features/manga/state/search-history";
import { source$ } from "@/features/manga/state/source";
import { settings$ } from "@/state/settings";
import type { SyncTable } from "../utils/watch-table";

/** `version` and `device` stay on each device. */
const SETTINGS_LOCAL = new Set(["version", "device"]);

const table = (
  name: string,
  obs$: ObservableParam,
  depth: number,
  synced?: SyncTable["synced"],
): SyncTable => ({ name, obs$, depth, synced });

/** Every store that syncs; the chapter lists, cookies and session never do. */
export const TABLES: SyncTable[] = [
  table("settings", settings$, 1, (key) => !SETTINGS_LOCAL.has(key)),
  table("matches", source$, 1),
  table("manual-matches", manualMatches$, 2),
  table("exclusions", exclusions$, 2),
  table("pins", pins$, 2),
  table("probes", probes$, 2),
  table("search-history", searchHistory$, 0),
];
