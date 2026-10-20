import { useCallback, useEffect, useRef, useState } from "react";
import { runtime } from "@/features/extensions";
import type { SourceMatch } from "@/features/manga/utils/source-match";
import { type Chapter, toChapters } from "@/features/manga/utils/to-chapters";

interface State {
  chapters: Chapter[];
  loading: boolean;
  error: string | null;
}

const EMPTY: State = { chapters: [], loading: false, error: null };

/** The chapters of the matched manga in its source; reloads when the match changes, nothing is persisted. */
export function useSourceChapters(match: SourceMatch | undefined) {
  const [state, setState] = useState<State>(EMPTY);
  const ticket = useRef(0);
  const sourceId = match?.sourceId;
  const url = match?.manga?.url;
  const title = match?.manga?.title;

  // A refresh keeps the rows on screen; a new match clears the previous manga's.
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
      try {
        const { chapters } = await runtime.chapters(sourceId, url, title);
        if (current === ticket.current)
          setState({
            chapters: toChapters(chapters),
            loading: false,
            error: null,
          });
      } catch (error) {
        if (current === ticket.current)
          setState({
            chapters: [],
            loading: false,
            error: error instanceof Error ? error.message : String(error),
          });
      }
    },
    [sourceId, url, title],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  const refresh = useCallback(() => load(false), [load]);

  return { ...state, refresh };
}
