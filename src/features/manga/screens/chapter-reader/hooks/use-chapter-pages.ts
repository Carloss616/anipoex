import { useCallback, useEffect, useRef, useState } from "react";
import { runtime, type SourcePage } from "@/features/extensions";

interface State {
  pages: SourcePage[];
  loading: boolean;
  error: string | null;
}

const EMPTY: State = { pages: [], loading: false, error: null };

/** The chapter's page images from its source; reloads when the chapter changes, nothing is persisted. */
export function useChapterPages(
  sourceId: string | undefined,
  chapterUrl: string | undefined,
) {
  const [state, setState] = useState<State>(EMPTY);
  const ticket = useRef(0);

  // A reload keeps the pages on screen so the reader stays put; a new chapter clears them.
  const load = useCallback(
    async (reset: boolean) => {
      const current = ++ticket.current;
      if (!sourceId || !chapterUrl) {
        setState(EMPTY);
        return;
      }
      setState((prev) => ({
        pages: reset ? [] : prev.pages,
        loading: true,
        error: null,
      }));
      try {
        const pages = await runtime.pages(sourceId, chapterUrl);
        if (current === ticket.current)
          setState({ pages, loading: false, error: null });
      } catch (error) {
        if (current === ticket.current)
          setState({
            pages: [],
            loading: false,
            error: error instanceof Error ? error.message : String(error),
          });
      }
    },
    [sourceId, chapterUrl],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  const reload = useCallback(() => {
    load(false);
  }, [load]);

  return { ...state, reload };
}
