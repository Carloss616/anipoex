import { useValue } from "@legendapp/state/react";
import { useEffect } from "react";
import {
  dropPosition,
  readingPositions$,
} from "@/features/manga/state/reading-positions";
import { mediaKey } from "@/features/manga/utils/msu";
import { livePosition } from "@/features/manga/utils/reading-position";

/**
 * The manga's position while its chapter is unread, and one that's read is
 * removed. `progress`: undefined while the entry loads (nothing is removed),
 * null when the manga isn't on the list.
 */
export function useLivePosition(
  mangaId: number,
  progress: number | null | undefined,
) {
  const entry$ = readingPositions$[mediaKey(mangaId)];
  const live = useValue(() => livePosition(entry$.get(), progress ?? 0));
  const dead = useValue(() => {
    const saved = entry$.get();
    return progress !== undefined && !!saved && !livePosition(saved, progress);
  });
  useEffect(() => {
    if (dead) dropPosition(mangaId);
  }, [dead, mangaId]);
  return dead ? undefined : live;
}
