import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/toast";
import { chapters$, readChapters } from "@/features/manga/state/chapters";
import { fetchChapters } from "@/features/manga/utils/fetch-chapters";
import type { SourceMatch } from "@/features/manga/utils/source-match";
import { type Chapter, toChapters } from "@/features/manga/utils/to-chapters";

interface State {
  chapters: Chapter[];
  loading: boolean;
  error: string | null;
}

const EMPTY: State = { chapters: [], loading: false, error: null };

/** The chapters of the matched manga in its source: the stored list when there is one, else fetched and stored; `refresh` fetches again. */
export function useSourceChapters(
  mangaId: number,
  match: SourceMatch | undefined,
) {
  const [state, setState] = useState<State>(EMPTY);
  const ticket = useRef(0);
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
        const stored = await readChapters(mangaId);
        if (current !== ticket.current) return;
        if (stored?.sourceId === sourceId && stored.url === url) {
          setState({
            chapters: toChapters(stored.chapters, title),
            loading: false,
            error: null,
          });
          return;
        }
      }
      try {
        const { chapters } = await fetchChapters(sourceId, url, title);
        chapters$[mangaId].set({ sourceId, url, chapters });
        if (current === ticket.current)
          setState({
            chapters: toChapters(chapters, title),
            loading: false,
            error: null,
          });
      } catch (error) {
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

  const refresh = useCallback(() => load(false), [load]);

  return { ...state, refresh };
}
