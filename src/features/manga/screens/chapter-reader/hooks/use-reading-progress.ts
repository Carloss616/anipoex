import { useRef, useState } from "react";
import { useSaveTracking } from "@/features/manga/hooks/use-save-tracking";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import {
  type ReadingSave,
  readingSave,
} from "@/features/manga/utils/reading-save";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import { toSaveVariables } from "@/features/manga/utils/tracking-form";
import type { ChapterEndProps } from "../components/chapter-end";

interface Notice {
  chapterId: string;
  state: "saved" | "confirm";
  result: ReadingSave;
  /** The entry "Add as Reading" created, which Undo deletes. */
  createdId?: number;
}

const NONE: ChapterEndProps["save"] = { state: "none", changes: [] };

/**
 * Saves AniList progress when a chapter's end is reached, with the tracking
 * sheet's rules; each chapter saves once per reader session, Undo included.
 */
export function useReadingProgress(
  manga: {
    id: number;
    chapters?: number | null;
    mediaListEntry?: { id?: number } | null;
  },
  /** The chapter on screen: a notice from another chapter is not shown. */
  chapterId: string | undefined,
) {
  const entryId = manga.mediaListEntry?.id;
  const entry = useTrackingEntry(entryId);
  const { save, remove } = useSaveTracking(manga.id);
  const [notice, setNotice] = useState<Notice>();
  const done = useRef(new Set<string>());
  const notNow = useRef(false);
  const ids = { mediaId: manga.id, entryId };

  const reached = (chapter: Chapter) => {
    // Every list entry has a status: without one the entry hasn't loaded, and saving would blank its fields.
    if (done.current.has(chapter.id) || (entryId != null && !entry?.status))
      return;
    done.current.add(chapter.id);

    const result = readingSave(
      entryId == null ? null : entry,
      chapter.number,
      manga.chapters,
      new Date(),
    );
    if (!result?.changes.length) return;

    if (!result.listed) {
      if (!notNow.current)
        setNotice({ chapterId: chapter.id, state: "confirm", result });
      return;
    }
    save(toSaveVariables(result.before, result.after, ids)).then(
      () => setNotice({ chapterId: chapter.id, state: "saved", result }),
      // useSaveTracking already toasted it.
      () => {},
    );
  };

  const add = () => {
    if (!notice) return;
    save(toSaveVariables(notice.result.before, notice.result.after, ids)).then(
      (createdId) => setNotice({ ...notice, state: "saved", createdId }),
      () => {},
    );
  };

  const undo = () => {
    if (!notice) return;
    const { before, after } = notice.result;
    (notice.createdId != null
      ? remove(notice.createdId)
      : save(toSaveVariables(after, before, ids))
    ).then(
      () => setNotice(undefined),
      () => {},
    );
  };

  return {
    reached,
    save:
      notice && notice.chapterId === chapterId
        ? { state: notice.state, changes: notice.result.changes }
        : NONE,
    undo,
    add,
    notNow: () => {
      notNow.current = true;
      setNotice(undefined);
    },
  };
}
