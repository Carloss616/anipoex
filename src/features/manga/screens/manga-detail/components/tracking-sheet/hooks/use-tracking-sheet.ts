import { useValue } from "@legendapp/state/react";
import { useEffect, useRef, useState } from "react";
import { useCustomLists } from "@/features/manga/hooks/use-manga-list-counts";
import { useSaveTracking } from "@/features/manga/hooks/use-save-tracking";
import type { MangaTracking } from "@/features/manga/hooks/use-tracking-entry";
import { queueEdit, queueRemoval } from "@/features/manga/state/queue-entry";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import {
  toSaveVariables,
  toTrackingForm,
} from "@/features/manga/utils/tracking-form";
import { isNetworkError } from "@/graphql/utils";
import { network$ } from "@/state/network";
import { session$ } from "@/state/session";
import { succeeded } from "@/utils/haptics";

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
  const names = useCustomLists()?.map((list) => list.name);
  const [form, setForm] = useState(() => toTrackingForm(tracking, names));
  const { save, remove, removing } = useSaveTracking(manga.id);
  const canScore = useValue(session$.user)?.scoreFormat != null;
  // What a save that fails late is compared with
  const shown = useRef(form);
  useEffect(() => {
    shown.current = form;
  });

  // The sheet stays mounted while closed, so the form seeds on every open;
  // seeding once would outlive any refetch that moves the entry ahead.
  const [wasPresented, setWasPresented] = useState(isPresented);
  if (isPresented !== wasPresented) {
    setWasPresented(isPresented);
    if (isPresented) setForm(toTrackingForm(tracking, names));
  }
  // Seeded before the names loaded, the form may hold a deleted list.
  const [hadNames, setHadNames] = useState(names != null);
  if (names != null && !hadNames) {
    setHadNames(true);
    setForm((current) => ({
      ...current,
      customLists: current.customLists.filter((name) => names.includes(name)),
    }));
  }

  /** Every field saves as it is confirmed, so there is no draft to discard. */
  const commit = (next: TrackingForm) => {
    setForm(next);
    if (!network$.online.peek()) {
      queueEdit(manga.id, entryId, form, next);
      succeeded();
      return;
    }
    save(toSaveVariables(form, next, { mediaId: manga.id, entryId }), {
      queueOffline: true,
    }).then(
      (entry) => {
        // A new entry saved with no status gets AniList's default (Reading).
        const status = entry?.status ?? undefined;
        setForm((current) =>
          current.status || !status ? current : { ...current, status },
        );
      },
      (error) => {
        if (isNetworkError(error)) {
          queueEdit(manga.id, entryId, form, next, shown.current);
          succeeded();
          return;
        }
        // Put back what AniList has, unless another field was confirmed since.
        setForm((current) => (current === next ? form : current));
      },
    );
  };

  /** Whether the entry is gone; on a failure the error link toasts it. */
  const removeEntry = async () => {
    if (entryId == null) return false;
    if (!network$.online.peek()) {
      queueRemoval(manga.id, entryId);
      succeeded();
      return true;
    }
    try {
      await remove(entryId, { queueOffline: true });
      return true;
    } catch (error) {
      if (!isNetworkError(error)) return false;
      queueRemoval(manga.id, entryId);
      succeeded();
      return true;
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
