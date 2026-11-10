import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { toast } from "@/components/ui/toast";
import { languages$ } from "@/features/extensions/state/languages";
import { ObservablePersist } from "@/state/observable-persist";
import { settings$ } from "@/state/settings";
import { bestSource, nextAutoPick } from "../utils/best-source";
import { fetchChapters } from "../utils/fetch-chapters";
import {
  AUTO_RECHECK_DAYS,
  FAR_BEHIND_GAP,
  mediaKey,
  PARALLEL_BATCH,
  type ProbeMap,
  type ProviderProbe,
} from "../utils/msu";
import {
  type ScanActivity,
  type ScanActivityArgs,
  startScanActivity,
} from "../utils/scan-activity";
import { markOf } from "../utils/scan-activity/utils/marks";
import type { Source } from "../utils/source";
import { unreadChapters } from "../utils/source-classify";
import {
  autoExclude,
  expiredAutoExclusions,
  isLive,
  recheckExclusions,
} from "../utils/source-exclusions";
import { readMatch, type Titles } from "../utils/source-match";
import { type ProbeRead, toProbe } from "../utils/source-probe";
import { toChapters } from "../utils/to-chapters";
import {
  CHAPTERS_TIMEOUT_MS,
  isTimeout,
  SEARCH_TIMEOUT_MS,
} from "../utils/with-timeout";
import { challenged$, recordChallenges } from "./challenged";
import { chapters$, chaptersKey, readChapters } from "./chapters";
import { exclusions$, pins$ } from "./exclusions";
import { readManual } from "./manual-matches";
import {
  deselectSource,
  findManga,
  restoreMatch,
  selectSource,
  source$,
} from "./source";

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
 * A timer firing this late ran out while iOS had the app suspended: every
 * pending one fires at once when it comes back.
 */
const SUSPENDED_MS = 5_000;

/** Per source, the Reading scan's reads waiting for their turn: a skip frees them. */
const queued = new Map<string, Set<() => void>>();

/** Per source, the end of its last read; exported for tests to reset. */
export const turns = new Map<string, Promise<unknown>>();

/**
 * Runs `read` once the source's reads for other manga end: one at a time per
 * source, so overlapping scans never queue in an extension's rate limit,
 * whose wait would count against the read's timeout.
 */
function inTurn<T>(sourceId: string, read: () => Promise<T>): Promise<T> {
  const last = turns.get(sourceId);
  const run = last ? last.then(read) : read();
  const settled = run.catch(() => {});
  turns.set(sourceId, settled);
  void settled.then(() => {
    if (turns.get(sourceId) === settled) turns.delete(sourceId);
  });
  return run;
}

/**
 * Stops waiting on one source of a running scan: the scan goes on without it,
 * keeping its last probe; the runtime's call runs out on its own.
 */
export const stopScan = (key: string, id: string) => stops[`${key}/${id}`]?.();

/** Stops every source a running scan of the manga holds. */
export function stopScanAll(key: string) {
  for (const id of Object.keys(stops))
    if (id.startsWith(`${key}/`)) stops[id]();
}

export interface ScanResult {
  /** False when nothing was left to scan or a Scan all of it is running. */
  scanned: boolean;
  /** Not scanned because every source left was probed recently. */
  recent?: boolean;
  /** Set when the scan picked a source: what to restore to undo it. */
  picked?: { id: string; previous: Parameters<typeof restoreMatch>[1] };
}

/**
 * Undoes a scan's pick only while it is still that pick: the user may have
 * picked by hand since.
 */
export function undoPick(
  mangaId: number,
  { id, previous }: NonNullable<ScanResult["picked"]>,
) {
  const now = readMatch(source$[mangaId].peek());
  if (now?.auto && now.sourceId === id) restoreMatch(mangaId, previous);
}

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
    const stored = manual
      ? undefined
      : (await readChapters(mangaId, source.id))?.manga;
    // The page an earlier read matched skips the search; one that fails or
    // comes back empty (moved, removed) is searched for again. A hung one
    // isn't: a search and a second read would only double the wait.
    let read =
      stored &&
      (await fetchChapters(source.id, stored, chaptersTimeoutMs).catch(
        (error) => {
          if (isTimeout(error)) throw error;
          return undefined;
        },
      ));
    const manga =
      manual ??
      (read?.chapters.length
        ? stored
        : await findManga(source.id, titles, timeoutMs));
    if (!manga) return toProbe(source, "no-match", Date.now());
    // The search found the page just read: its empty list stands.
    if (!read || manga.url !== stored?.url)
      read = await fetchChapters(source.id, manga, chaptersTimeoutMs);
    const { chapters } = read;
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
  cover?: string;
  /** Starts the scan's activity in place of its own, with no pick toast. */
  activity?: (args: ScanActivityArgs) => ScanActivity;
  /** Leaves out sources probed within these ms. */
  freshFor?: number;
  /** Leaves out sources that found no match within these ms. */
  missFor?: number;
  /**
   * Stops a source whose read runs past `after` ms and adds it to `skipped`
   * (id to name), which leaves it out of every scan sharing the map.
   */
  slow?: { after: number; skipped: Map<string, string> };
}): Promise<ScanResult> {
  const { mangaId, sources, titles, read, keep, only, name } = args;
  const key = mediaKey(mangaId);
  // One Scan all at a time; a rescan waits only for its own source's.
  if (
    only
      ? only.some((id) => scanning$[key][id].peek())
      : scanningAll$[key].peek()
  )
    return { scanned: false };

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
  const prev = { ...probes$[key].peek() };
  const within = (id: string, ms: number | undefined) =>
    ms !== undefined && (prev[id]?.updatedAt ?? 0) > Date.now() - ms;
  const candidates = sources.filter(
    (s) => ids.includes(s.id) && !busy[s.id] && !args.slow?.skipped.has(s.id),
  );
  const targets = candidates.filter(
    (s) =>
      !within(s.id, args.freshFor) &&
      !(
        prev[s.id] &&
        !prev[s.id].matched &&
        !prev[s.id].errored &&
        within(s.id, args.missFor)
      ),
  );
  if (targets.length === 0)
    return { scanned: false, recent: candidates.length > 0 };

  // Added beside the sources other rescans are probing, not over them.
  for (const s of targets) scanning$[key][s.id].set(true);
  if (!only) {
    scanningAll$[key].set(true);
    scanProgress$[key].set({ done: 0, total: targets.length });
  }
  const activity = (args.activity ?? startScanActivity)({
    mangaId,
    name: name ?? titles.search[0] ?? "",
    total: targets.length,
    source: only && targets.length === 1 ? targets[0] : undefined,
    cover: args.cover,
    sources: targets.map((s) => ({
      id: s.id,
      name: s.name,
      initials: s.initials,
      iconUrl: s.iconUrl,
      state: "pending",
    })),
    onStop: () => stopScanAll(key),
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
  // A stop frees the row at once; before its turn, the source is never read.
  const halts = Object.fromEntries(
    targets.map((s) => {
      const id = `${key}/${s.id}`;
      return [
        s.id,
        new Promise<null>((resolve) => {
          stops[id] = () => {
            delete stops[id];
            stopped.add(s.id);
            const last = prev[s.id];
            activity.mark(
              s.id,
              last ? markOf(last, read()) : { state: "pending" },
            );
            scanning$[key][s.id].delete();
            done();
            resolve(null);
          };
        }),
      ];
    }),
  );
  const result: ScanResult = { scanned: true };

  // A pool, not batches: a slow source holds one slot while the rest move on,
  // instead of holding up the whole batch behind it.
  let next = 0;
  const work = async () => {
    while (next < targets.length) {
      const source = targets[next++];
      if (stopped.has(source.id)) continue;
      const { slow } = args;
      // Stopped like a Stop: its last probe stays, its row is freed. Once
      // stopped, `stops` may hold a newer scan's read of the same source.
      const skip = () => {
        if (!stopped.has(source.id)) stops[`${key}/${source.id}`]?.();
        return null;
      };
      if (slow?.skipped.has(source.id)) {
        skip();
        continue;
      }
      activity.mark(source.id, { state: "scanning" });
      const waiting = slow && (queued.get(source.id) ?? new Set());
      if (waiting) queued.set(source.id, waiting.add(skip));
      const probe = await Promise.race([
        // A source stopped or skipped while it waited is never read.
        inTurn(source.id, async () => {
          waiting?.delete(skip);
          if (stopped.has(source.id)) return null;
          if (slow?.skipped.has(source.id)) return skip();
          // Timed from its turn, not from the wait behind other manga.
          let timer: ReturnType<typeof setTimeout> | undefined;
          const arm = () => {
            if (!slow) return;
            const due = Date.now() + slow.after;
            timer = setTimeout(() => {
              // The read waited out a suspension: it wasn't slow.
              if (Date.now() - due > SUSPENDED_MS) return arm();
              slow.skipped.set(source.id, source.name);
              skip();
              for (const next of queued.get(source.id) ?? []) next();
              queued.delete(source.id);
            }, slow.after);
          };
          arm();
          try {
            return await probeSource(mangaId, source, titles);
          } finally {
            clearTimeout(timer);
          }
        }),
        halts[source.id],
      ]);
      waiting?.delete(skip);
      if (!probe) continue;
      delete stops[`${key}/${source.id}`];
      landed[source.id] = probe;
      probes$[key][source.id].set(probe);
      activity.mark(source.id, markOf(probe, read()));
      // Judged before its row is freed, so it moves once.
      judge(source.id, probe);
      scanning$[key][source.id].delete();
      done();
    }
  };

  try {
    await Promise.all(
      Array.from({ length: Math.min(PARALLEL_BATCH, targets.length) }, work),
    );
  } finally {
    if (!only) {
      scanningAll$[key].delete();
      scanProgress$[key].delete();
    }
    activity.end(Object.values(landed).filter((p) => p.matched).length);
    await recordChallenges(sources);
    // A manga read from no source, or from one a scan picked, gets the best
    // one, so its +N shows.
    const previous = source$[mangaId].peek();
    const probes = probes$[key].peek() ?? {};
    const id = nextAutoPick(
      readMatch(previous),
      bestSource(sources, exclusions$[key].peek() ?? {}, probes, {
        challenged: challenged$.peek(),
        languages: languages$.peek(),
      }),
      settings$.sources.autoPick.peek(),
    );
    const picked = sources.find((s) => s.id === id);
    if (picked) {
      void selectSource(mangaId, picked, titles, undefined, true);
      const pick = { id: picked.id, previous };
      result.picked = pick;
      if (!args.activity) {
        const unread = unreadChapters(read(), probes[picked.id].latest);
        toast(
          unread
            ? `Now reading from ${picked.name} · +${unread}`
            : `Now reading from ${picked.name}`,
          {
            action: {
              label: "Undo pick",
              onAction: () => undoPick(mangaId, pick),
            },
          },
        );
      }
    }
  }
  return result;
}
