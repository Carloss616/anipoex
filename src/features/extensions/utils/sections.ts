import { type Extension, hasUpdate } from "./extension";
import type { ExtensionFilter } from "./filters";
import { baseLang } from "./languages";

export type ExtensionSection = {
  key: "installed" | "available" | "updates";
  title: string;
  data: Extension[];
};

export function toSections(
  extensions: Extension[],
  query: {
    filter: ExtensionFilter;
    /** A code; `all` for every language; none for `preferred`, plus multi. */
    language: string | undefined;
    search: string;
    /** The user's base languages. */
    preferred: readonly string[];
  },
): ExtensionSection[] {
  const needle = query.search.trim().toLowerCase();
  const { language, preferred } = query;
  // Yours limits only what can be installed: an installed one always shows.
  const inLanguage = ({ installed, language: { code } }: Extension) =>
    language === "all" ||
    (language
      ? code === language
      : installed || code === "mul" || preferred.includes(baseLang(code)));
  const shown = extensions.filter(
    (e) => inLanguage(e) && (!needle || e.name.toLowerCase().includes(needle)),
  );
  // Stable sort: pending updates first, registry order otherwise.
  const installed = shown
    .filter((e) => e.installed)
    .sort((a, b) => Number(hasUpdate(b)) - Number(hasUpdate(a)));
  const available = shown.filter((e) => !e.installed);

  const byFilter: Record<ExtensionFilter, ExtensionSection[]> = {
    all: [
      { key: "installed", title: "Installed", data: installed },
      { key: "available", title: "Available", data: available },
    ],
    installed: [{ key: "installed", title: "Installed", data: installed }],
    available: [{ key: "available", title: "Available", data: available }],
    updates: [
      { key: "updates", title: "Updates", data: installed.filter(hasUpdate) },
    ],
  };

  return byFilter[query.filter].filter((s) => s.data.length > 0);
}

/** One list row: sections render flat so lists recycle per row, not section. */
export type ExtensionListRow =
  | { kind: "header"; key: string; section: ExtensionSection }
  | {
      kind: "extension";
      key: string;
      extension: Extension;
      /** Its place in its section, for dividers and rounded ends. */
      index: number;
      count: number;
    };

export function toRows(sections: ExtensionSection[]): ExtensionListRow[] {
  return sections.flatMap((section): ExtensionListRow[] => [
    { kind: "header", key: `header-${section.key}`, section },
    ...section.data.map((extension, i) => ({
      kind: "extension" as const,
      key: extension.id,
      extension,
      index: i,
      count: section.data.length,
    })),
  ]);
}

/** Where the headers sit, for a list's sticky headers. */
export function headerIndices(rows: ExtensionListRow[]): number[] {
  return rows.flatMap((row, i) => (row.kind === "header" ? [i] : []));
}
