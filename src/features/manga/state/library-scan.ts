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
import { libraryStatus, runLibrary, scanOrder } from "../utils/library-run";
import { mediaKey, RECENT_SCAN_MS } from "../utils/msu";
import { startLibraryActivity } from "../utils/scan-activity";
import { unreadChapters } from "../utils/source-classify";
import { readMatch, searchTitles } from "../utils/source-match";
import { toEntries } from "../utils/to-entries";
import { manualTitles } from "./manual-matches";
import { probes$, scanSources, stopScanAll } from "./probes";
import { restoreMatch, source$ } from "./source";

/** The Reading scan's place in the list (1-based) while it runs; not persisted. */
export const libraryScan$ = observable<{ index: number; total: number } | null>(
  null,
);

// Set before the list loads, so a second tap during the query is dropped too.
let running = false;
let stopped = false;
let current: number | undefined;

/** Stops the Reading scan: the manga in progress at once, then the rest. */
export function stopReadingScan() {
  stopped = true;
  if (current !== undefined) stopScanAll(mediaKey(current));
}

/**
 * Scans every manga in Reading, never-probed and stalest first, skipping
 * sources probed within the hour unless `everything`.
 */
export async function scanReading({ everything = false } = {}) {
  if (running) return;
  running = true;
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
    // Unpersisted: a scan from the list may run before a screen loaded it.
    if (!installedLoaded$.peek()) await refreshInstalled();

    const { summary, picks } = await runLibrary({
      entries,
      scan: (entry, activity) => {
        current = entry.mangaId;
        const installed = installed$.peek();
        const keep = readMatch(source$[entry.mangaId].peek())?.sourceId;
        return scanSources({
          mangaId: entry.mangaId,
          sources: withChosen(
            toSources(installed),
            toSources(installed, { all: true }),
            keep,
          ),
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
        });
      },
      unread: (entry) => {
        const id = readMatch(source$[entry.mangaId].peek())?.sourceId;
        const probe = id
          ? probes$[mediaKey(entry.mangaId)][id].peek()
          : undefined;
        return probe?.matched ? unreadChapters(entry.read, probe.latest) : 0;
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
                for (const p of picks) restoreMatch(p.mangaId, p.previous);
              },
            },
          }
        : undefined,
    );
  } finally {
    running = false;
    current = undefined;
    libraryScan$.set(null);
  }
}
