import { useValue } from "@legendapp/state/react";
import {
  downloadQueue$,
  downloadsPaused$,
  downloadTitle,
} from "@/features/downloads";
import { canMoveUp } from "../../../utils/state";
import { chapterLabel, downloadLine } from "../utils";

/** A download's leaves, so a row re-renders only when what it shows changes. */
export function useDownloadItem(id: string) {
  const item$ = downloadQueue$[id];
  const manga = useValue(item$.manga.title) ?? "";
  const number = useValue(item$.chapter.number) ?? -1;
  const name = useValue(item$.chapter.name) ?? "";
  const cover = useValue(item$.manga.cover);
  const state = useValue(item$.state) ?? "queued";
  const error = useValue(item$.error);
  const paused = useValue(downloadsPaused$);
  const movable = useValue(() => canMoveUp(id));

  const chapter = chapterLabel(number, name);

  return {
    title: manga,
    /** Names the chapter too, for the row's buttons. */
    label: downloadTitle(manga, { number, name }),
    cover,
    chapter,
    state,
    line: downloadLine(chapter, state, error, paused),
    canMoveUp: movable,
  };
}
