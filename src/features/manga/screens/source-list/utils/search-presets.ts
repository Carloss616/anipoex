import type { MenuAction } from "@/components/ui/menu";
import type { ProviderProbe } from "@/features/manga/utils/msu";
import type { ExcludedRow, SourceRow } from "./split-sources";

export type Preset = "unmatched" | "excluded" | "all";

const PRESETS: Preset[] = ["unmatched", "excluded", "all"];

/**
 * The sources a title search preset covers. Unmatched leaves failed sources
 * out: their search fails the same way, so they keep their Retry.
 */
export function presetIds(
  preset: Preset,
  available: SourceRow[],
  excluded: ExcludedRow[],
  probeOf: (sourceId: string) => ProviderProbe | undefined,
): string[] {
  const unmatched = (id: string) => {
    const probe = probeOf(id);
    return !!probe && !probe.matched && !probe.errored;
  };
  const rows =
    preset === "unmatched"
      ? [
          ...available.filter((row) => unmatched(row.source.id)),
          ...excluded.filter((row) => row.reason === "not-matched"),
        ]
      : preset === "excluded"
        ? excluded
        : [...available, ...excluded];
  return rows.map((row) => row.source.id);
}

/**
 * The header's title search menu: each preset that adds sources, with how
 * many, and Stop while any searches. A preset only adds: sources already
 * searching keep their results.
 */
export function titleSearchItems(
  available: SourceRow[],
  excluded: ExcludedRow[],
  probeOf: (sourceId: string) => ProviderProbe | undefined,
  searching: (sourceId: string) => boolean,
  start: (sourceIds: string[]) => void,
  stop: () => void,
): MenuAction[] {
  const running = presetIds("all", available, excluded, probeOf).filter(
    searching,
  );
  const presets = PRESETS.map((preset) => ({
    preset,
    ids: presetIds(preset, available, excluded, probeOf).filter(
      (id) => !searching(id),
    ),
  })).filter(({ ids }) => ids.length > 0);
  return [
    ...presets.map(({ preset, ids }) => ({
      label: running.length
        ? `Add ${preset} (+${ids.length})`
        : `Search ${preset} (${ids.length})`,
      onPress: () => start(ids),
    })),
    ...(running.length
      ? [
          {
            label: `Stop searching (${running.length})`,
            destructive: true,
            onPress: stop,
          },
        ]
      : []),
  ];
}
