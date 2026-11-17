import type { Observable } from "@legendapp/state";
import type { DnsId } from "@/features/extensions/runtime/runtime";
import { type Repo, storedRepo } from "@/features/extensions/utils/repo";
import {
  type HomeLayout,
  normalizeLayout,
} from "@/features/home/utils/home-layout";
import type { TitlePosition } from "@/features/manga/components/manga-card";
import {
  type ListOptions,
  normalizeListOptions,
} from "@/features/manga/utils/list-options";
import {
  DEFAULT_DENSITY,
  type Density,
} from "@/features/manga/utils/list-view";
import {
  THEME_FAMILIES,
  type ThemeFamilyId,
  type ThemePreference,
} from "@/state/theme/constants";

export interface Settings {
  /** 0 until the legacy tables were migrated. */
  version: number;
  theme: { family: ThemeFamilyId; preference: ThemePreference };
  home: HomeLayout;
  mangaList: { density: Density; title: TitlePosition };
  extensions: { repos: Repo[] };
  sources: {
    autoPick: boolean;
    languages: string[];
    /** Seconds a source's read may take in a Reading scan; 0 never skips. */
    slowSkip: number;
  };
  /** This device's own values, never synced. */
  device: {
    dns?: DnsId;
    /** Names this device's sync files. */
    id?: string;
    /** The folder this device syncs through: a path, or a SAF URI on Android. */
    folder?: string;
    /** Minutes between syncs while the app is open; 0 never polls. */
    syncInterval?: number;
    /** Where chapter downloads go; "sync" follows `folder`. */
    downloadsIn?: "sync" | "folder" | "device";
    /** Same format as `folder`; used when `downloadsIn` is "folder". */
    downloadsFolder?: string;
    /**
     * The manga list's filters and sort, kept per device: unread and
     * downloads differ by device.
     */
    mangaList?: ListOptions;
  };
}

export const SETTINGS_VERSION = 1;

/** The tables each setting lived in before `settings`. */
export const LEGACY_TABLES = [
  "theme",
  "home-layout",
  "manga-list-view",
  "extension-repos",
] as const;

type Raw = Record<string, unknown> | undefined;

const section = (raw: unknown): Raw =>
  raw && typeof raw === "object" ? (raw as Record<string, unknown>) : undefined;

/** Fills each section a stored value lacks, from another build or none. */
export function normalizeSettings(raw: unknown): Settings {
  const root = section(raw);
  const theme = section(root?.theme);
  const mangaList = section(root?.mangaList);
  const repos = section(root?.extensions)?.repos;
  const sources = section(root?.sources);
  const device = section(root?.device);
  const dns = device?.dns as DnsId | undefined;
  const id = typeof device?.id === "string" ? device.id : undefined;
  const folder = typeof device?.folder === "string" ? device.folder : undefined;
  const syncInterval =
    typeof device?.syncInterval === "number" ? device.syncInterval : undefined;
  const downloadsIn = ["sync", "folder", "device"].includes(
    device?.downloadsIn as string,
  )
    ? (device?.downloadsIn as Settings["device"]["downloadsIn"])
    : undefined;
  const downloadsFolder =
    typeof device?.downloadsFolder === "string"
      ? device.downloadsFolder
      : undefined;
  const listOptions = normalizeListOptions(device?.mangaList);
  return {
    version: typeof root?.version === "number" ? root.version : 0,
    theme: {
      family: (theme?.family as ThemeFamilyId) ?? THEME_FAMILIES[0].id,
      preference: (theme?.preference as ThemePreference) ?? "system",
    },
    home: normalizeLayout(root?.home),
    mangaList: {
      density: (mangaList?.density as Density) ?? DEFAULT_DENSITY,
      title: (mangaList?.title as TitlePosition) ?? "split",
    },
    extensions: {
      repos: Array.isArray(repos) ? repos.map(storedRepo) : [],
    },
    sources: {
      autoPick:
        typeof sources?.autoPick === "boolean" ? sources.autoPick : true,
      languages: Array.isArray(sources?.languages)
        ? sources.languages.filter((code) => typeof code === "string")
        : [],
      slowSkip: typeof sources?.slowSkip === "number" ? sources.slowSkip : 60,
    },
    device: {
      ...(dns && { dns }),
      ...(id && { id }),
      ...(folder && { folder }),
      ...(syncInterval !== undefined && { syncInterval }),
      ...(downloadsIn && { downloadsIn }),
      ...(downloadsFolder && { downloadsFolder }),
      ...(listOptions && { mangaList: listOptions }),
    },
  };
}

/** The settings the per-setting tables held, read through `read`. */
export function migrateLegacy(
  read: (table: (typeof LEGACY_TABLES)[number]) => unknown,
): Partial<Settings> {
  const theme = section(read("theme"));
  const home = read("home-layout");
  const mangaList = read("manga-list-view");
  const repos = read("extension-repos");
  return {
    ...(theme && {
      theme: {
        family: theme.family,
        preference: theme.preference,
      } as Settings["theme"],
    }),
    ...(home !== undefined && { home: home as HomeLayout }),
    ...(mangaList !== undefined && {
      mangaList: mangaList as Settings["mangaList"],
    }),
    ...(Array.isArray(repos) && { extensions: { repos } }),
  };
}

/**
 * Once per device (`version` 0): copies what the old tables held into
 * `settings$`, then deletes them. `open` reads a table and deletes it.
 */
export function moveLegacyIn(
  settings$: Observable<Settings>,
  open: (table: (typeof LEGACY_TABLES)[number]) => {
    value: unknown;
    delete: () => void;
  },
) {
  if (settings$.version.peek() !== 0) return;
  const tables = LEGACY_TABLES.map((name) => [name, open(name)] as const);
  const legacy = Object.fromEntries(tables);
  settings$.set(
    normalizeSettings({
      ...settings$.peek(),
      ...migrateLegacy((name) => legacy[name].value),
      version: SETTINGS_VERSION,
    }),
  );
  for (const [, table] of tables) table.delete();
}
