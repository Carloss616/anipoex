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
import { MangaListDocument } from "../graphql/manga-list.generated";
import { readableSources } from "../utils/best-source";
import { libraryStatus, runLibrary, scanOrder } from "../utils/library-run";
import { AUTO_RECHECK_DAYS, mediaKey, RECENT_SCAN_MS } from "../utils/msu";
import { startLibraryActivity } from "../utils/scan-activity";
import { unreadChapters } from "../utils/source-classify";
import { readMatch, searchTitles } from "../utils/source-match";
import { toEntries } from "../utils/to-entries";
import { exclusions$ } from "./exclusions";
import { manualTitles } from "./manual-matches";
import { probes$, scanSources, stopScanAll, undoPick } from "./probes";
import { source$ } from "./source";

/**
 * While the Reading scan runs, the manga it is on (1-based; 0 before the
 * first, total 0 while the list loads); not persisted.
 */
export const libraryScan$ = observable<{ index: number; total: number } | null>(
  null,
);

const DAY_MS = 86_400_000;

let stopped = false;
let current: number | undefined;

/** Stops the Reading scan: the manga in progress at once, then the rest. */
export function stopReadingScan() {
  stopped = true;
  if (current !== undefined) stopScanAll(mediaKey(current));
}

/**
 * Scans every manga in Reading, never-probed and stalest first. Unless
 * `everything`, it skips sources probed within the hour and those that found
 * no match within the week.
 */
export async function scanReading({ everything = false } = {}) {
  // Set before the list loads, so a second tap during the query is dropped too.
  if (libraryScan$.peek()) return;
  libraryScan$.set({ index: 0, total: 0 });
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
    const entries = scanOrder(
      [...media.values()].map((m) => ({
        mangaId: m.id,
        name: m.title?.userPreferred ?? "",
        cover: m.coverImage?.medium ?? undefined,
        read: m.mediaListEntry?.progress ?? 0,
      })),
      probes$.peek(),
    );
    const total = entries.length;
    libraryScan$.set({ index: 0, total });
    // Unpersisted: a scan from the list may run before a screen loaded it.
    if (!installedLoaded$.peek()) await refreshInstalled();
    // A Stop tapped while the list loaded: nothing ran, so nothing to report.
    if (stopped) return;
    if (!installed$.peek().length) {
      toast("No sources installed");
      return;
    }

    const sourcesOf = (mangaId: number) => {
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
    };

    const { summary, picks } = await runLibrary({
      entries,
      scan: (entry, activity) => {
        current = entry.mangaId;
        const { keep, sources } = sourcesOf(entry.mangaId);
        return scanSources({
          mangaId: entry.mangaId,
          sources,
          titles: searchTitles(
            media.get(entry.mangaId) ?? {},
            manualTitles(entry.mangaId),
          ),
          read: () => entry.read,
          keep,
          name: entry.name,
          cover: entry.cover,
          activity,
          freshFor: everything ? undefined : RECENT_SCAN_MS,
          missFor: everything ? undefined : AUTO_RECHECK_DAYS * DAY_MS,
        });
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
        return Math.max(
          0,
          ...readable.map((s) =>
            unreadChapters(entry.read, probes[s.id].latest),
          ),
        );
      },
      activity: startLibraryActivity({ total, onStop: stopReadingScan }),
      stopped: () => stopped,
      onIndex: (index) => libraryScan$.set({ index, total }),
    });

    toast(
      libraryStatus(summary),
      picks.length
        ? {
            action: {
              label: "Undo",
              onAction: () => {
                for (const p of picks) undoPick(p.mangaId, p);
              },
            },
          }
        : undefined,
    );
  } finally {
    current = undefined;
    libraryScan$.set(null);
  }
}
