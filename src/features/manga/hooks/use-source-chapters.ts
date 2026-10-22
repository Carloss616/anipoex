import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/toast";
import { installed$, toSources } from "@/features/extensions";
import {
  chapters$,
  chaptersKey,
  readChapters,
} from "@/features/manga/state/chapters";
import { recordProbe } from "@/features/manga/state/probes";
import type { StoredChapters } from "@/features/manga/utils/chapter-storage";
import { fetchChapters } from "@/features/manga/utils/fetch-chapters";
import type { SourceMatch } from "@/features/manga/utils/source-match";
import { type Chapter, toChapters } from "@/features/manga/utils/to-chapters";

interface State {
  chapters: Chapter[];
  loading: boolean;
  error: string | null;
}

const EMPTY: State = { chapters: [], loading: false, error: null };

/** The chapters of the matched manga in its source: the list stored for that source when there is one, else fetched and stored; `refresh` fetches again. */
export function useSourceChapters(
  mangaId: number,
  match: SourceMatch | undefined,
) {
  const [state, setState] = useState<State>(EMPTY);
  const ticket = useRef(0);
  // The entry this hook wrote last, so its own write isn't shown twice.
  const written = useRef<StoredChapters>(undefined);
  const sourceId = match?.sourceId;
  const url = match?.manga?.url;
  const title = match?.manga?.title;

  // A refresh keeps the rows on screen, even when it fails; a new match clears the previous manga's.
  const load = useCallback(
    async (reset: boolean) => {
      const current = ++ticket.current;
      if (!sourceId || url === undefined || title === undefined) {
        setState(EMPTY);
        return;
      }
      setState((prev) => ({
        chapters: reset ? [] : prev.chapters,
        loading: true,
        error: null,
      }));
      if (reset) {
        const stored = await readChapters(mangaId, sourceId);
        if (current !== ticket.current) return;
        if (stored?.manga.url === url) {
          setState({
            chapters: toChapters(stored.chapters, title),
            loading: false,
            error: null,
          });
          return;
        }
      }
      const source = {
        id: sourceId,
        name:
          toSources(installed$.peek()).find(({ id }) => id === sourceId)
            ?.name ?? sourceId,
      };
      try {
        const { chapters } = await fetchChapters(sourceId, url, title);
        // A refresh keeps the cover a scan stored for the same page.
        const kept = chapters$[chaptersKey(mangaId, sourceId)].peek()?.manga;
        const thumbnailUrl = kept?.url === url ? kept.thumbnailUrl : undefined;
        written.current = { manga: { url, title, thumbnailUrl }, chapters };
        chapters$[chaptersKey(mangaId, sourceId)].set(written.current);
        const rows = toChapters(chapters, title);
        recordProbe(mangaId, source, { chapters: rows });
        if (current === ticket.current)
          setState({ chapters: rows, loading: false, error: null });
      } catch (error) {
        recordProbe(mangaId, source, { error });
        if (current !== ticket.current) return;
        const message = error instanceof Error ? error.message : String(error);
        if (!reset) toast.destructive("Couldn't refresh chapters");
        setState((prev) => ({
          chapters: reset ? [] : prev.chapters,
          loading: false,
          error: message,
        }));
      }
    },
    [mangaId, sourceId, url, title],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  // A scan stores a newer list for this source: the rows follow it.
  useEffect(() => {
    if (!sourceId || url === undefined || title === undefined) return;
    return chapters$[chaptersKey(mangaId, sourceId)].onChange(
      ({ value, isFromSync }) => {
        if (isFromSync || value === written.current || value?.manga.url !== url)
          return;
        setState({
          chapters: toChapters(value.chapters, title),
          loading: false,
          error: null,
        });
      },
    );
  }, [mangaId, sourceId, url, title]);

  const refresh = useCallback(() => load(false), [load]);

  return { ...state, refresh };
}
