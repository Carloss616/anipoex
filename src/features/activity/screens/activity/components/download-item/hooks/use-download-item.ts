import { useValue } from "@legendapp/state/react";
import {
  downloadQueue$,
  downloadsPaused$,
  downloadTitle,
} from "@/features/downloads";
import { canMoveUp } from "../../../utils/state";
import { downloadLine } from "../utils";

/** A download's leaves, so a row re-renders only when what it shows changes. */
export function useDownloadItem(id: string) {
  const item$ = downloadQueue$[id];
  const manga = useValue(item$.manga.title) ?? "";
  const number = useValue(item$.chapter.number) ?? -1;
  const name = useValue(item$.chapter.name) ?? "";
  const cover = useValue(item$.manga.cover);
  const source = useValue(item$.source.name) ?? "";
  const state = useValue(item$.state) ?? "queued";
  const error = useValue(item$.error);
  const paused = useValue(downloadsPaused$);
  const movable = useValue(() => canMoveUp(id));

  return {
    title: downloadTitle(manga, { number, name }),
    cover,
    source,
    state,
    line: downloadLine(source, state, error, paused),
    canMoveUp: movable,
  };
}
