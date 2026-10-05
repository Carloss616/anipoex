import { useCallback, useMemo, useState } from "react";

export type ExtensionLanguage = "en" | "es" | "multi" | "ja";

export interface Extension {
  id: string;
  name: string;
  author: string;
  version: string;
  latestVersion: string;
  language: ExtensionLanguage;
  description: string;
  installs: number;
  nsfw: boolean;
  installed: boolean;
  enabled: boolean;
  accent: string;
  initials: string;
}

export const LANGUAGE_LABEL: Record<ExtensionLanguage, string> = {
  en: "English",
  es: "Español",
  multi: "Multi",
  ja: "日本語",
};

const SEED: Extension[] = [
  {
    id: "mangadex",
    name: "MangaDex",
    author: "community",
    version: "1.4.2",
    latestVersion: "1.4.2",
    language: "multi",
    description:
      "Official MangaDex API — covers, chapters, and multi-lang titles.",
    installs: 184_200,
    nsfw: false,
    installed: true,
    enabled: true,
    accent: "#FF6740",
    initials: "MD",
  },
  {
    id: "weebcentral",
    name: "Weeb Central",
    author: "keiyoushi",
    version: "2.1.0",
    latestVersion: "2.1.0",
    language: "en",
    description: "Fast English scans with reliable chapter ordering.",
    installs: 96_400,
    nsfw: false,
    installed: true,
    enabled: true,
    accent: "#5B8CFF",
    initials: "WC",
  },
  {
    id: "mangafire",
    name: "MangaFire",
    author: "extensions-lab",
    version: "1.0.8",
    latestVersion: "1.1.0",
    language: "en",
    description: "Broad English catalog. Update available.",
    installs: 71_800,
    nsfw: false,
    installed: true,
    enabled: false,
    accent: "#E11D48",
    initials: "MF",
  },
  {
    id: "comick",
    name: "ComicK",
    author: "community",
    version: "3.2.1",
    latestVersion: "3.2.4",
    language: "multi",
    description: "Community mirrors with language filters and following.",
    installs: 122_000,
    nsfw: false,
    installed: true,
    enabled: true,
    accent: "#22C55E",
    initials: "CK",
  },
  {
    id: "komga",
    name: "Komga",
    author: "gotson",
    version: "1.8.0",
    latestVersion: "1.8.0",
    language: "multi",
    description: "Self-hosted library — connect to your own Komga server.",
    installs: 41_200,
    nsfw: false,
    installed: false,
    enabled: false,
    accent: "#0EA5E9",
    initials: "KG",
  },
  {
    id: "suwayomi",
    name: "Suwayomi",
    author: "suwayomi",
    version: "0.9.4",
    latestVersion: "0.9.4",
    language: "multi",
    description: "Tachiyomi-compatible server for your local extensions.",
    installs: 28_600,
    nsfw: false,
    installed: false,
    enabled: false,
    accent: "#A855F7",
    initials: "SW",
  },
  {
    id: "lectormanga",
    name: "LectorManga",
    author: "es-sources",
    version: "1.3.5",
    latestVersion: "1.3.5",
    language: "es",
    description: "Spanish scans and scanlation groups in one feed.",
    installs: 54_100,
    nsfw: false,
    installed: false,
    enabled: false,
    accent: "#F59E0B",
    initials: "LM",
  },
  {
    id: "mangakatana",
    name: "MangaKatana",
    author: "keiyoushi",
    version: "1.2.0",
    latestVersion: "1.2.0",
    language: "en",
    description: "English titles with clean chapter lists.",
    installs: 39_900,
    nsfw: false,
    installed: false,
    enabled: false,
    accent: "#14B8A6",
    initials: "MK",
  },
  {
    id: "cubari",
    name: "Cubari",
    author: "community",
    version: "2.0.1",
    latestVersion: "2.0.1",
    language: "multi",
    description: "Proxy-friendly reader for Imgur and GitHub proxies.",
    installs: 18_300,
    nsfw: false,
    installed: false,
    enabled: false,
    accent: "#64748B",
    initials: "CU",
  },
  {
    id: "rawkuma",
    name: "RawKuma",
    author: "jp-sources",
    version: "0.4.2",
    latestVersion: "0.4.2",
    language: "ja",
    description: "Japanese raws for early chapter tracking.",
    installs: 12_700,
    nsfw: false,
    installed: false,
    enabled: false,
    accent: "#F43F5E",
    initials: "RK",
  },
];

export function formatInstalls(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function useExtensionsStore() {
  const [extensions, setExtensions] = useState(SEED);

  const install = useCallback((id: string) => {
    setExtensions((prev) =>
      prev.map((ext) =>
        ext.id === id
          ? {
              ...ext,
              installed: true,
              enabled: true,
              version: ext.latestVersion,
            }
          : ext,
      ),
    );
  }, []);

  const uninstall = useCallback((id: string) => {
    setExtensions((prev) =>
      prev.map((ext) =>
        ext.id === id ? { ...ext, installed: false, enabled: false } : ext,
      ),
    );
  }, []);

  const setEnabled = useCallback((id: string, enabled: boolean) => {
    setExtensions((prev) =>
      prev.map((ext) => (ext.id === id ? { ...ext, enabled } : ext)),
    );
  }, []);

  const update = useCallback((id: string) => {
    setExtensions((prev) =>
      prev.map((ext) =>
        ext.id === id ? { ...ext, version: ext.latestVersion } : ext,
      ),
    );
  }, []);

  const updateAll = useCallback(() => {
    setExtensions((prev) =>
      prev.map((ext) =>
        ext.installed && ext.version !== ext.latestVersion
          ? { ...ext, version: ext.latestVersion }
          : ext,
      ),
    );
  }, []);

  const installed = useMemo(
    () => extensions.filter((ext) => ext.installed),
    [extensions],
  );
  const available = useMemo(
    () => extensions.filter((ext) => !ext.installed),
    [extensions],
  );
  const outdated = useMemo(
    () =>
      extensions.filter(
        (ext) => ext.installed && ext.version !== ext.latestVersion,
      ),
    [extensions],
  );
  const featured = useMemo(
    () => extensions.filter((ext) => !ext.installed).slice(0, 4),
    [extensions],
  );

  return {
    extensions,
    installed,
    available,
    outdated,
    featured,
    install,
    uninstall,
    setEnabled,
    update,
    updateAll,
  };
}

export type ExtensionsStore = ReturnType<typeof useExtensionsStore>;
