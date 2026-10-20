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
  state: "saving" | "saved" | "confirm";
  result: ReadingSave;
  /** The entry "Add to list" created, which Undo deletes. */
  createdId?: number;
}

const NONE: ChapterEndProps["save"] = { state: "none", changes: [] };

/** Saves AniList progress at a chapter's end with the tracking sheet's rules, once per chapter per reader session. */
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
  // A second tap lands before the re-render that hides or disables the button.
  const busy = useRef(false);
  const ids = { mediaId: manga.id, entryId };

  // A write settles only the notice it started from: another chapter's may have replaced it meanwhile.
  const settle = (from: Notice, to?: Notice) =>
    setNotice((shown) => (shown === from ? to : shown));

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
    // Shown before the write lands, so leaving early never hides it.
    const saving: Notice = { chapterId: chapter.id, state: "saving", result };
    setNotice(saving);
    save(toSaveVariables(result.before, result.after, ids)).then(
      () => settle(saving, { ...saving, state: "saved" }),
      // useSaveTracking already toasted it.
      () => settle(saving),
    );
  };

  const add = () => {
    if (notice?.state !== "confirm" || busy.current) return;
    busy.current = true;
    const saving: Notice = { ...notice, state: "saving" };
    setNotice(saving);
    save(toSaveVariables(notice.result.before, notice.result.after, ids))
      .then(
        (createdId) => settle(saving, { ...saving, state: "saved", createdId }),
        () => settle(saving, notice),
      )
      .finally(() => {
        busy.current = false;
      });
  };

  const undo = () => {
    if (notice?.state !== "saved" || busy.current) return;
    busy.current = true;
    const { before, after } = notice.result;
    (notice.createdId != null
      ? remove(notice.createdId)
      : save(toSaveVariables(after, before, ids))
    )
      .then(
        () => settle(notice),
        () => {},
      )
      .finally(() => {
        busy.current = false;
      });
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
