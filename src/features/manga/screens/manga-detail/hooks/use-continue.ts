import type { Observable } from "@legendapp/state";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { useInstalledSources } from "@/features/extensions";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import {
  type ContinueReading,
  continueReading$,
} from "@/features/manga/state/continue-reading";
import type { ContinueKind } from "@/features/manga/utils/continue-label";
import { continueChapter } from "@/features/manga/utils/next-chapter";
import type { SourceMatch } from "@/features/manga/utils/source-match";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import type { MangaDetail } from "@/features/manga/utils/to-detail";

export interface ContinueAction {
  kind: ContinueKind;
  chapter?: Chapter;
}

/** The action; null with nothing to open (loading, no match, all read). */
export type Continue$ = Observable<ContinueAction | null>;

/** Called from a leaf, so a progress change re-renders only it. */
export function useContinue(
  manga: MangaDetail,
  chapters: Chapter[],
  match: SourceMatch | undefined,
  continue$: Continue$,
) {
  const progress = useTrackingEntry(manga.mediaListEntry?.id)?.progress ?? 0;
  const source = useInstalledSources().find((s) => s.id === match?.sourceId);
  const chapter = match ? continueChapter(chapters, progress) : undefined;
  const started = progress > 0;
  const kind = !match ? "pick" : started ? "continue" : "start";

  useEffect(() => {
    const current = continue$.peek();
    if (!match) {
      if (current?.kind !== "pick") continue$.set({ kind: "pick" });
    } else if (!chapter) {
      if (current) continue$.set(null);
    } else if (current?.kind !== kind || current.chapter !== chapter) {
      continue$.set({ kind, chapter });
    }
  }, [continue$, match, chapter, kind]);

  useFocusEffect(
    useCallback(() => {
      if (!chapter) return;
      const value: ContinueReading = {
        mangaId: manga.id,
        chapterId: chapter.id,
        number: chapter.number,
        title: chapter.title,
        started,
        source,
      };
      continueReading$.set(value);
      // Only its own: a detail pushed over this one sets it first.
      return () => {
        if (continueReading$.peek() === value) continueReading$.set(null);
      };
    }, [manga.id, chapter, started, source]),
  );
}
