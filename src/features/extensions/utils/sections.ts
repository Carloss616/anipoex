import { type Extension, hasUpdate } from "./extension";
import type { ExtensionFilter } from "./filters";

export type ExtensionSection = {
  key: "installed" | "available" | "updates";
  title: string;
  data: Extension[];
};

export function toSections(
  extensions: Extension[],
  query: {
    filter: ExtensionFilter;
    language: string | undefined;
    search: string;
  },
): ExtensionSection[] {
  const needle = query.search.trim().toLowerCase();
  const shown = extensions.filter(
    (e) =>
      (!query.language || e.language === query.language) &&
      (!needle || e.name.toLowerCase().includes(needle)),
  );
  // Stable sort: pending updates first, registry order otherwise.
  const installed = shown
    .filter((e) => e.installed)
    .sort((a, b) => Number(hasUpdate(b)) - Number(hasUpdate(a)));

  const sections: ExtensionSection[] =
    query.filter === "updates"
      ? [
          {
            key: "updates",
            title: "Updates",
            data: installed.filter(hasUpdate),
          },
        ]
      : [
          { key: "installed", title: "Installed", data: installed },
          ...(query.filter === "all"
            ? [
                {
                  key: "available" as const,
                  title: "Available",
                  data: shown.filter((e) => !e.installed),
                },
              ]
            : []),
        ];

  return sections.filter((s) => s.data.length > 0);
}

/** One list row: lists render sections flat so they recycle per row, not per section. */
export type ExtensionListRow =
  | { kind: "header"; key: string; section: ExtensionSection }
  | {
      kind: "extension";
      key: string;
      extension: Extension;
      /** A divider above it: every row of a section but the first. */
      divided: boolean;
    };

export function toRows(sections: ExtensionSection[]): ExtensionListRow[] {
  return sections.flatMap((section): ExtensionListRow[] => [
    { kind: "header", key: `header-${section.key}`, section },
    ...section.data.map((extension, i) => ({
      kind: "extension" as const,
      key: extension.id,
      extension,
      divided: i > 0,
    })),
  ]);
}

/** Where the headers sit, for a list's sticky headers. */
export function headerIndices(rows: ExtensionListRow[]): number[] {
  return rows.flatMap((row, i) => (row.kind === "header" ? [i] : []));
}
