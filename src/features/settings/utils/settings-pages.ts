import type { Href } from "expo-router";

export type SettingsPageId =
  | "account"
  | "activity"
  | "appearance"
  | "home"
  | "sync"
  | "sources"
  | "downloads"
  | "about";

export type SettingsGroup = "status" | "general" | "sources";

export interface SettingsPage {
  id: SettingsPageId;
  title: string;
  href: Href & string;
  /** Account has none: the index shows it as its header. */
  group?: SettingsGroup;
  /** Shown only where the extension runtime runs. */
  runtimeOnly?: boolean;
  /** Routes pushed from this page, which keep it active in the sidebar. */
  subpaths?: string[];
}

/**
 * Every settings page, in index order. Pure data, so tests can read it:
 * icons and summaries live in `page-details.ts`.
 */
export const SETTINGS_PAGES: SettingsPage[] = [
  { id: "account", title: "Account", href: "/settings/account" },
  {
    id: "activity",
    title: "Activity",
    href: "/settings/activity",
    group: "status",
    subpaths: ["/settings/pending"],
  },
  {
    id: "appearance",
    title: "Appearance",
    href: "/settings/appearance",
    group: "general",
  },
  { id: "home", title: "Home", href: "/settings/layout", group: "general" },
  { id: "sync", title: "Sync", href: "/settings/sync", group: "general" },
  { id: "about", title: "About", href: "/settings/about", group: "general" },
  {
    id: "sources",
    title: "Sources",
    href: "/settings/sources",
    group: "sources",
    runtimeOnly: true,
    subpaths: ["/settings/languages"],
  },
  {
    id: "downloads",
    title: "Downloads",
    href: "/settings/downloads",
    group: "sources",
    runtimeOnly: true,
  },
];

const GROUP_TITLES: Record<SettingsGroup, string> = {
  status: "Status",
  general: "General",
  sources: "Sources",
};

export const visiblePages = (runtime: boolean) =>
  SETTINGS_PAGES.filter((page) => runtime || !page.runtimeOnly);

/** The grouped pages in group order; Account and empty groups left out. */
export function groupPages(pages: SettingsPage[]) {
  return (Object.keys(GROUP_TITLES) as SettingsGroup[])
    .map((group) => ({
      group,
      title: GROUP_TITLES[group],
      pages: pages.filter((page) => page.group === group),
    }))
    .filter((group) => group.pages.length);
}

export const pageForPath = (pathname: string) =>
  SETTINGS_PAGES.find(
    (page) => page.href === pathname || page.subpaths?.includes(pathname),
  )?.id;
