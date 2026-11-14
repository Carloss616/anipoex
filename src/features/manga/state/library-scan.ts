import { observable } from "@legendapp/state";
import { toast } from "@/components/ui/toast";
import {
  installed$,
  installedLoaded$,
  refreshInstalled,
  toSources,
  withChosen,
} from "@/features/extensions";
import { client } from "@/graphql/client";
import { MediaListStatus } from "@/graphql/types.generated";
import { session$ } from "@/state/session";
import { settings$ } from "@/state/settings";
import { MangaListDocument } from "../graphql/manga-list.generated";
import { readableSources } from "../utils/best-source";
import {
  type LibraryEntry,
  libraryStatus,
  runLibrary,
  scanOrder,
} from "../utils/library-run";
import { AUTO_RECHECK_DAYS, mediaKey, RECENT_SCAN_MS } from "../utils/msu";
import { startLibraryActivity } from "../utils/scan-activity";
import { unreadChapters } from "../utils/source-classify";
import { readMatch, searchTitles } from "../utils/source-match";
import { type MangaEntry, toEntries } from "../utils/to-entries";
import { exclusions$ } from "./exclusions";
import { manualTitles } from "./manual-matches";
import { probes$, scanSources, stopScanAll, undoPick } from "./probes";
import {
  endRun,
  fillQueue,
  queueRetry,
  readingQueue,
  readingQueue$,
  readingRun$,
  settle,
} from "./reading-queue";
import { source$ } from "./source";

const DAY_MS = 86_400_000;

/** The installed sources a scan of the manga reads, its pick kept among them. */
function sourcesOf(mangaId: number) {
  const installed = installed$.peek();
  const keep = readMatch(source$[mangaId].peek())?.sourceId;
  return {
    keep,
    sources: withChosen(
      toSources(installed),
      toSources(installed, { all: true }),
      keep,
    ),
  };
}

/**
 * Scans one manga's sources from where no sheet is open (a card's menu),
 * skipping what the Reading scan skips unless `everything`.
 */
export async function scanManga(
  media: MangaEntry,
  read: number,
  { everything = false } = {},
) {
  // Unpersisted: the list can be the first screen to scan.
  if (!installedLoaded$.peek()) await refreshInstalled();
  if (!installed$.peek().length) {
    toast("No sources installed");
    return;
  }
  const { keep, sources } = sourcesOf(media.id);
  const result = await scanSources({
    mangaId: media.id,
    sources,
    titles: searchTitles(media, manualTitles(media.id)),
    read: () => read,
    keep,
    name: media.title?.userPreferred ?? undefined,
    cover: media.coverImage?.medium ?? undefined,
    freshFor: everything ? undefined : RECENT_SCAN_MS,
    missFor: everything ? undefined : AUTO_RECHECK_DAYS * DAY_MS,
  });
  if (result.recent) toast("Checked recently");
}

/** Whether the Reading scan runs, list loading included; not persisted. */
export const libraryScan$ = observable(false);

let stopped = false;
/** The run's sources skipped as slow, id to name; a retry takes one out. */
let skipped = new Map<string, string>();
/** The run's manga by id, for a retry to queue again. */
let entries = new Map<number, LibraryEntry>();

/** Stops the Reading scan: the manga in progress at once, then the rest. */
export function stopReadingScan() {
  stopped = true;
  for (const m of Object.values(readingQueue$.peek()))
    if (m.state === "running") stopScanAll(mediaKey(m.mangaId));
}

/**
 * Reads a slow source again, with no time limit, for each manga it was left
 * out of: they go last in the queue.
 */
export function retrySkipped(sourceId: string) {
  const missed = readingRun$.skipped[sourceId].peek();
  if (!missed || stopped) return;
  skipped.delete(sourceId);
  readingRun$.skipped[sourceId].delete();
  for (const id of missed.mangaIds) {
    const entry = entries.get(id);
    if (entry) queueRetry(entry, sourceId);
  }
}

export function retryAllSkipped() {
  for (const id of Object.keys(readingRun$.skipped.peek() ?? {}))
    retrySkipped(id);
}

/** Adds the manga to the ones the slow source was left out of. */
function missed(sourceId: string, mangaId: number) {
  const skipped$ = readingRun$.skipped[sourceId];
  const ids = skipped$.mangaIds.peek();
  if (ids?.includes(mangaId)) return;
  if (ids) skipped$.mangaIds.push(mangaId);
  else
    skipped$.set({
      name: skipped.get(sourceId) ?? sourceId,
      mangaIds: [mangaId],
    });
}

/**
 * Scans every manga in Reading, never-probed and stalest first. Unless
 * `everything`, it skips sources probed within the hour and those that found
 * no match within the week.
 */
export async function scanReading({ everything = false } = {}) {
  // Set before the list loads, so a second tap during the query is dropped too.
  if (libraryScan$.peek()) return;
  libraryScan$.set(true);
  stopped = false;
  try {
    const userId = session$.user.peek()?.id;
    const result =
      userId == null
        ? { data: undefined }
        : await client
            .query({
              query: MangaListDocument,
              variables: { userId, status: MediaListStatus.Current },
              fetchPolicy: "cache-first",
            })
            // The error link has toasted it.
            .catch(() => null);
    if (!result) return;
    const media = new Map(toEntries(result.data).map((m) => [m.id, m]));
    if (!media.size) {
      toast("No manga in Reading");
      return;
    }
    const ordered = scanOrder(
      [...media.values()].map((m) => ({
        mangaId: m.id,
        name: m.title?.userPreferred ?? "",
        cover: m.coverImage?.medium ?? undefined,
        read: m.mediaListEntry?.progress ?? 0,
      })),
      probes$.peek(),
    );
    const total = ordered.length;
    // Unpersisted: a scan from the list may run before a screen loaded it.
    if (!installedLoaded$.peek()) await refreshInstalled();
    // A Stop tapped while the list loaded: nothing ran, so nothing to report.
    if (stopped) return;
    if (!installed$.peek().length) {
      toast("No sources installed");
      return;
    }

    skipped = new Map();
    entries = new Map(ordered.map((e) => [e.mangaId, e]));
    fillQueue(ordered);
    // A read past this is stopped, and its source skipped for the rest of the run.
    const slowAfter = settings$.sources.slowSkip.peek() * 1000;
    const { summary, picks } = await runLibrary({
      queue: readingQueue,
      skipped,
      scan: (entry, activity) => {
        const { keep, sources } = sourcesOf(entry.mangaId);
        // A retry reads its sources whatever their last read or speed.
        const limits = !entry.only && !everything;
        return scanSources({
          mangaId: entry.mangaId,
          sources,
          titles: searchTitles(
            media.get(entry.mangaId) ?? {},
            manualTitles(entry.mangaId),
          ),
          read: () => entry.read,
          keep,
          only: entry.only,
          name: entry.name,
          cover: entry.cover,
          activity,
          freshFor: limits ? RECENT_SCAN_MS : undefined,
          missFor: limits ? AUTO_RECHECK_DAYS * DAY_MS : undefined,
          slow:
            slowAfter && !entry.only
              ? {
                  after: slowAfter,
                  skipped,
                  missed: (id) => missed(id, entry.mangaId),
                }
              : undefined,
        }).finally(() => settle(entry.id));
      },
      // Any source the manga can be read from counts, not only the one picked:
      // a manga with no pick, or a pick behind, still has new chapters.
      unread: (entry) => {
        const key = mediaKey(entry.mangaId);
        const probes = probes$[key].peek() ?? {};
        const readable = readableSources(
          sourcesOf(entry.mangaId).sources,
          exclusions$[key].peek() ?? {},
          probes,
        );
        const n = Math.max(
          0,
          ...readable.map((s) =>
            unreadChapters(entry.read, probes[s.id].latest),
          ),
        );
        if (n > 0) readingRun$.withNew[entry.mangaId].set(true);
        return n;
      },
      activity: startLibraryActivity({ total, onStop: stopReadingScan }),
      stopped: () => stopped,
    });

    toast(
      libraryStatus(summary),
      picks.length
        ? {
            action: {
              label: "Undo picks",
              onAction: () => {
                for (const p of picks) undoPick(p.mangaId, p);
              },
            },
          }
        : undefined,
    );
  } finally {
    endRun();
    libraryScan$.set(false);
  }
}
