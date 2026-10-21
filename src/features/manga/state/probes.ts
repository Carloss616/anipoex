import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";
import { fetchChapters } from "../utils/fetch-chapters";
import {
  AUTO_RECHECK_DAYS,
  FAR_BEHIND_GAP,
  mediaKey,
  PARALLEL_BATCH,
  type ProbeMap,
  type ProviderProbe,
} from "../utils/msu";
import type { Source } from "../utils/source";
import {
  autoExclude,
  expiredAutoExclusions,
  isLive,
  recheckExclusions,
} from "../utils/source-exclusions";
import { readMatch, type Titles } from "../utils/source-match";
import { type ProbeRead, toProbe } from "../utils/source-probe";
import { toChapters } from "../utils/to-chapters";
import { SEARCH_TIMEOUT_MS } from "../utils/with-timeout";
import { chapters$, chaptersKey } from "./chapters";
import { exclusions$, pins$ } from "./exclusions";
import { findManga, source$ } from "./source";

/** Per manga, what each source's last scan found: MSU's `probes` map (gist file `seanime-msu-probes.json`). */
export const probes$ = observable<Record<string, ProbeMap>>({});

/** Per manga, the source ids being probed right now; not persisted. */
export const scanning$ = observable<Record<string, Record<string, true>>>({});

/** Per manga, whether the scan running now is a Scan all (no `only`); not persisted. */
export const scanningAll$ = observable<Record<string, true>>({});

/** Whether a scan of the manga runs right now; read at call time, not at render. */
export const isScanning = (mangaId: number) =>
  Object.keys(scanning$[mediaKey(mangaId)].peek() ?? {}).length > 0;

/** The same, tracked: a `Computed` or `useValue` reading it updates when a scan starts or ends. */
export const isScanBusy = (key: string) =>
  Object.keys(scanning$[key].get() ?? {}).length > 0;

syncObservable(probes$, {
  persist: { name: "source-probes", plugin: ObservablePersist },
});

/** A real read of one source for the manga, which stores the chapters it finds; never rejects, a failure is an error probe. */
export async function probeSource(
  mangaId: number,
  source: { id: string; name: string },
  titles: Titles,
  timeoutMs = SEARCH_TIMEOUT_MS,
): Promise<ProviderProbe> {
  try {
    const manga = await findManga(source.id, titles, timeoutMs);
    if (!manga) return toProbe(source, "no-match", Date.now());
    const { chapters } = await fetchChapters(
      source.id,
      manga.url,
      manga.title,
      timeoutMs,
    );
    chapters$[chaptersKey(mangaId, source.id)].set({
      manga: { url: manga.url, title: manga.title },
      chapters,
    });
    return toProbe(
      source,
      { chapters: toChapters(chapters, manga.title) },
      Date.now(),
    );
  } catch (error) {
    return toProbe(source, { error }, Date.now());
  }
}

/** A read of the chosen source outside a scan (its chapters, or no match) is a probe too, so the source sheet shows what it found. */
export function recordProbe(
  mangaId: number,
  source: { id: string; name: string },
  read: ProbeRead,
) {
  probes$[mediaKey(mangaId)][source.id].set(toProbe(source, read, Date.now()));
}

/** Probes the manga's sources (all not excluded, or `only`) and writes each probe as it lands; rescans of different sources run together, a Scan all alone. */
export async function scanSources(args: {
  mangaId: number;
  sources: Source[];
  titles: Titles;
  /** Read when the scan ends: the reader may raise progress meanwhile. */
  read: () => number;
  keep: string | undefined;
  only?: string[];
}): Promise<void> {
  const { mangaId, sources, titles, read, keep, only } = args;
  const key = mediaKey(mangaId);
  // A Scan all waits for every scan to end; a rescan only for its own source's.
  if (only ? only.some((id) => scanning$[key][id].peek()) : isScanning(mangaId))
    return;

  const excluded = exclusions$[key].peek() ?? {};
  const pinned = pins$[key].peek() ?? {};
  const installed = new Set(sources.map((s) => s.id));
  const expired = only
    ? []
    : expiredAutoExclusions(
        excluded,
        pinned,
        Date.now(),
        AUTO_RECHECK_DAYS,
      ).filter((id) => installed.has(id));
  const ids = only ?? [
    ...sources.filter((s) => !isLive(excluded[s.id])).map((s) => s.id),
    ...expired,
  ];
  const targets = sources.filter((s) => ids.includes(s.id));
  if (targets.length === 0) return;

  const prev = { ...probes$[key].peek() };
  // Added beside the sources other rescans are probing, not over them.
  for (const s of targets) scanning$[key][s.id].set(true);
  if (!only) scanningAll$[key].set(true);

  try {
    const landed: ProbeMap = {};
    for (let i = 0; i < targets.length; i += PARALLEL_BATCH) {
      await Promise.all(
        targets.slice(i, i + PARALLEL_BATCH).map(async (source) => {
          const probe = await probeSource(mangaId, source, titles);
          landed[source.id] = probe;
          probes$[key][source.id].set(probe);
          scanning$[key][source.id].delete();
        }),
      );
    }

    const now = Date.now();
    const progress = read();
    // The source picked now, not at the start: the user may switch to one mid-scan.
    const picked = readMatch(source$[mangaId].peek())?.sourceId ?? keep;
    const rest = Object.fromEntries(
      Object.entries(landed).filter(([id]) => !expired.includes(id)),
    );
    const rechecked = recheckExclusions(
      exclusions$[key].peek() ?? {},
      landed,
      expired,
      progress,
      FAR_BEHIND_GAP,
      now,
    );
    exclusions$[key].set(
      autoExclude(
        rechecked,
        pins$[key].peek() ?? {},
        rest,
        prev,
        progress,
        FAR_BEHIND_GAP,
        picked,
      ),
    );
  } finally {
    scanningAll$[key].delete();
  }
}
