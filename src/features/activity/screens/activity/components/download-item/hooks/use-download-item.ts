import { useValue } from "@legendapp/state/react";
import { downloadQueue$ } from "@/features/downloads";
import { canMoveUp } from "../../../utils/state";

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
  const movable = useValue(() => canMoveUp(id));

  return {
    title: `${manga} · ${number >= 0 ? `Chapter ${number}` : name}`,
    cover,
    source,
    state,
    /** Under the title when it isn't running: the source and its state. */
    line: `${source} · ${state === "failed" ? (error ?? "Failed") : "Queued"}`,
    canMoveUp: movable,
  };
}
