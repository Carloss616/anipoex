import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";
import { bestSource } from "../utils/best-source";
import { fetchChapters } from "../utils/fetch-chapters";
import {
  AUTO_RECHECK_DAYS,
  FAR_BEHIND_GAP,
  mediaKey,
  PARALLEL_BATCH,
  type ProbeMap,
  type ProviderProbe,
} from "../utils/msu";
import { startScanActivity } from "../utils/scan-activity";
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
import { CHAPTERS_TIMEOUT_MS, SEARCH_TIMEOUT_MS } from "../utils/with-timeout";
import { recordChallenges } from "./challenged";
import { chapters$, chaptersKey } from "./chapters";
import { exclusions$, pins$ } from "./exclusions";
import { readManual } from "./manual-matches";
import { deselectSource, findManga, selectSource, source$ } from "./source";

/**
 * Per manga, each source's last scan: MSU's `probes` map (gist file
 * `seanime-msu-probes.json`).
 */
export const probes$ = observable<Record<string, ProbeMap>>({});

/** Per manga, the source ids being probed right now; not persisted. */
export const scanning$ = observable<Record<string, Record<string, true>>>({});

/** Per manga: the running scan is a Scan all (no `only`). Not persisted. */
export const scanningAll$ = observable<Record<string, true>>({});

/** Per manga, a Scan all's sources landed or stopped out of its total; not persisted. */
export const scanProgress$ = observable<
  Record<string, { done: number; total: number }>
>({});

/** Whether a scan of the manga runs now; for call time, not render. */
export const isScanning = (mangaId: number) =>
  Object.keys(scanning$[mediaKey(mangaId)].peek() ?? {}).length > 0;

/** Tracked: a `Computed` or `useValue` updates when a scan starts or ends. */
export const isScanBusy = (key: string) =>
  Object.keys(scanning$[key].get() ?? {}).length > 0;

/** Per `key/id`, what stops waiting on a source a scan holds; not persisted. */
const stops: Record<string, () => void> = {};

/**
 * Stops waiting on one source of a running scan: the scan goes on without it,
 * keeping its last probe; the runtime's call runs out on its own.
 */
export const stopScan = (key: string, id: string) => stops[`${key}/${id}`]?.();

syncObservable(probes$, {
  persist: { name: "source-probes", plugin: ObservablePersist },
});

/**
 * A real read of one source for the manga, storing the chapters it finds.
 * Never rejects: a failure is an error probe.
 */
export async function probeSource(
  mangaId: number,
  source: { id: string; name: string },
  titles: Titles,
  timeoutMs = SEARCH_TIMEOUT_MS,
  chaptersTimeoutMs = CHAPTERS_TIMEOUT_MS,
): Promise<ProviderProbe> {
  try {
    const manual = readManual(mangaId, source.id);
    const manga = manual ?? (await findManga(source.id, titles, timeoutMs));
    if (!manga) return toProbe(source, "no-match", Date.now());
    const { chapters } = await fetchChapters(
      source.id,
      manga,
      chaptersTimeoutMs,
    );
    // A manual page undone while its chapters loaded keeps none: stored, they
    // would make it the source's match again.
    if (manual && readManual(mangaId, source.id)?.url !== manual.url)
      return toProbe(source, "no-match", Date.now());
    chapters$[chaptersKey(mangaId, source.id)].set({
      manga: {
        url: manga.url,
        title: manga.title,
        thumbnailUrl: manga.thumbnailUrl,
        memo: manga.memo,
      },
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

/**
 * A read of the chosen source outside a scan (its chapters, or no match) is a
 * probe too, so the source sheet shows what it found.
 */
export function recordProbe(
  mangaId: number,
  source: { id: string; name: string },
  read: ProbeRead,
) {
  probes$[mediaKey(mangaId)][source.id].set(toProbe(source, read, Date.now()));
}

/**
 * Probes the manga's sources (all not excluded, or `only`), writing each probe
 * as it lands. Rescans of different sources run together, a Scan all beside
 * them.
 */
export async function scanSources(args: {
  mangaId: number;
  sources: Source[];
  titles: Titles;
  /** Read as each source lands: the reader may raise progress meanwhile. */
  read: () => number;
  keep: string | undefined;
  only?: string[];
  /** What a scan calls the manga outside the app. */
  name?: string;
}): Promise<void> {
  const { mangaId, sources, titles, read, keep, only, name } = args;
  const key = mediaKey(mangaId);
  // One Scan all at a time; a rescan waits only for its own source's.
  if (
    only
      ? only.some((id) => scanning$[key][id].peek())
      : scanningAll$[key].peek()
  )
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
  // A Scan all leaves the sources a rescan is probing to it.
  const busy = scanning$[key].peek() ?? {};
  const targets = sources.filter((s) => ids.includes(s.id) && !busy[s.id]);
  if (targets.length === 0) return;

  const prev = { ...probes$[key].peek() };
  // Added beside the sources other rescans are probing, not over them.
  for (const s of targets) scanning$[key][s.id].set(true);
  if (!only) {
    scanningAll$[key].set(true);
    scanProgress$[key].set({ done: 0, total: targets.length });
  }
  const activity = startScanActivity({
    mangaId,
    name: name ?? titles.search[0] ?? "",
    total: targets.length,
    source: only && targets.length === 1 ? targets[0] : undefined,
  });
  // Each source is judged as it lands, on the state of that moment: what the
  // user decided meanwhile, the progress, the source picked now.
  const judge = (id: string, probe: ProviderProbe) => {
    const excludedNow = exclusions$[key].peek() ?? {};
    const pinnedNow = pins$[key].peek() ?? {};
    const progress = read();
    const picked = readMatch(source$[mangaId].peek())?.sourceId ?? keep;
    // A source still excluded by itself is rechecked; any other judged anew.
    const next =
      isLive(excludedNow[id]) && !isLive(pinnedNow[id])
        ? recheckExclusions(
            excludedNow,
            { [id]: probe },
            [id],
            progress,
            FAR_BEHIND_GAP,
            Date.now(),
          )
        : autoExclude(
            excludedNow,
            pinnedNow,
            { [id]: probe },
            prev,
            progress,
            FAR_BEHIND_GAP,
            picked,
          );
    exclusions$[key].set(next);
    // An excluded source has nothing to read: the detail asks for another.
    if (picked === id && isLive(next[id])) deselectSource(mangaId, id);
  };
  const landed: ProbeMap = {};
  const stopped = new Set<string>();
  const done = () => {
    const count = Object.keys(landed).length + stopped.size;
    activity.progress(count);
    if (!only) scanProgress$[key].done.set(count);
  };
  // A stop frees the row at once; before its batch, the source is never read.
  const halts = Object.fromEntries(
    targets.map((s) => {
      const id = `${key}/${s.id}`;
      return [
        s.id,
        new Promise<null>((resolve) => {
          stops[id] = () => {
            delete stops[id];
            stopped.add(s.id);
            scanning$[key][s.id].delete();
            done();
            resolve(null);
          };
        }),
      ];
    }),
  );

  try {
    for (let i = 0; i < targets.length; i += PARALLEL_BATCH) {
      await Promise.all(
        targets.slice(i, i + PARALLEL_BATCH).map(async (source) => {
          if (stopped.has(source.id)) return;
          const probe = await Promise.race([
            probeSource(mangaId, source, titles),
            halts[source.id],
          ]);
          if (!probe) return;
          delete stops[`${key}/${source.id}`];
          landed[source.id] = probe;
          probes$[key][source.id].set(probe);
          // Judged before its row is freed, so it moves once.
          judge(source.id, probe);
          scanning$[key][source.id].delete();
          done();
        }),
      );
    }
  } finally {
    if (!only) {
      scanningAll$[key].delete();
      scanProgress$[key].delete();
    }
    activity.end(Object.values(landed).filter((p) => p.matched).length);
    await recordChallenges(sources);
    // A manga read from no source gets the best one, so its +N shows.
    if (!readMatch(source$[mangaId].peek())) {
      const best = bestSource(
        sources,
        exclusions$[key].peek() ?? {},
        probes$[key].peek() ?? {},
      );
      const picked = sources.find((s) => s.id === best);
      if (picked) void selectSource(mangaId, picked, titles);
    }
  }
}
