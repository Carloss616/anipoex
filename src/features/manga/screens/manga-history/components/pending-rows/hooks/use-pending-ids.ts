import { useValue } from "@legendapp/state/react";
import { pendingEntries$ } from "@/features/manga/state/pending-entries";

/** The media ids with changes waiting to sync; only `mediaId` when given. */
export function usePendingIds(mediaId: number | undefined) {
  // A string, so it re-renders only when the ids change, not their contents.
  const ids = useValue(() =>
    Object.keys(pendingEntries$.get() ?? {})
      .filter((id) => mediaId == null || id === String(mediaId))
      .join(","),
  );
  return ids ? ids.split(",") : [];
}
