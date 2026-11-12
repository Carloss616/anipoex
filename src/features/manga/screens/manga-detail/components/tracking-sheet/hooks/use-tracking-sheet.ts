import { useValue } from "@legendapp/state/react";
import { useState } from "react";
import { useSaveTracking } from "@/features/manga/hooks/use-save-tracking";
import type { MangaTracking } from "@/features/manga/hooks/use-tracking-entry";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import {
  toSaveVariables,
  toTrackingForm,
} from "@/features/manga/utils/tracking-form";
import { session$ } from "@/state/session";

/** The entry the tracking sheet edits, however the platform swaps its views. */
export function useTrackingSheet({
  isPresented,
  manga,
  tracking,
}: {
  isPresented: boolean;
  manga: MangaDetail;
  tracking: MangaTracking;
}) {
  const entryId = manga.mediaListEntry?.id;
  const [form, setForm] = useState(() => toTrackingForm(tracking));
  const { save, remove, removing } = useSaveTracking(manga.id);
  const canScore = useValue(session$.user)?.scoreFormat != null;

  // The sheet stays mounted while closed, so the form seeds on every open;
  // seeding once would outlive any refetch that moves the entry ahead.
  const [wasPresented, setWasPresented] = useState(isPresented);
  if (isPresented !== wasPresented) {
    setWasPresented(isPresented);
    if (isPresented) setForm(toTrackingForm(tracking));
  }

  /** Every field saves as it is confirmed, so there is no draft to discard. */
  const commit = (next: TrackingForm) => {
    setForm(next);
    save(toSaveVariables(form, next, { mediaId: manga.id, entryId })).then(
      (entry) => {
        // A new entry saved with no status gets AniList's default (Reading).
        const status = entry?.status ?? undefined;
        setForm((current) =>
          current.status || !status ? current : { ...current, status },
        );
      },
      () => {
        // Put back what AniList has, unless another field was confirmed since.
        setForm((current) => (current === next ? form : current));
      },
    );
  };

  /** Whether the entry is gone; on a failure the error link toasts it. */
  const removeEntry = async () => {
    if (entryId == null) return false;
    try {
      await remove(entryId);
      return true;
    } catch {
      return false;
    }
  };

  return {
    form,
    commit,
    removeEntry,
    removing,
    canRemove: entryId != null,
    canScore,
    total: manga.chapters,
  };
}
