import type { ReactNode } from "react";
import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useSaveTracking } from "@/features/manga/hooks/use-save-tracking";
import type { MangaTracking } from "@/features/manga/hooks/use-tracking-entry";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import {
  toSaveVariables,
  toTrackingForm,
} from "@/features/manga/utils/tracking-form";
import { DateView } from "./date-view";
import type { Field } from "./overview";
import { Overview } from "./overview";
import { Progress } from "./progress";
import { Score } from "./score";
import { Status } from "./status";

export interface TrackingSheetProps {
  isPresented: boolean;
  manga: MangaDetail;
  tracking: MangaTracking;
  onDismiss: () => void;
}

/** Holds the entry and swaps between the overview and the field being edited. */
export function TrackingSheet({
  isPresented,
  manga,
  tracking,
  onDismiss,
}: TrackingSheetProps) {
  const entryId = manga.mediaListEntry?.id;
  const total = manga.chapters;

  const [form, setForm] = useState(() => toTrackingForm(tracking));
  const [editing, setEditing] = useState<Field | null>(null);
  const { save, remove, removing } = useSaveTracking(manga.id);

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
    setEditing(null);
    save(toSaveVariables(next, { mediaId: manga.id, entryId }));
  };

  const onRemove = async () => {
    if (entryId == null) return;
    await remove(entryId);
    setEditing(null);
    onDismiss();
  };

  const back = () => setEditing(null);

  const dateView = (key: "startedAt" | "completedAt") => (
    <DateView
      title={key === "startedAt" ? "Start date" : "Finish date"}
      value={form[key]}
      onCancel={back}
      onConfirm={(date) => commit({ ...form, [key]: date })}
    />
  );

  const views: Record<Field, () => ReactNode> = {
    status: () => (
      <Status form={form} total={total} onCancel={back} onConfirm={commit} />
    ),
    progress: () => (
      <Progress form={form} total={total} onCancel={back} onConfirm={commit} />
    ),
    score: () => (
      <Score
        value={form.score}
        onCancel={back}
        onConfirm={(score) => commit({ ...form, score })}
      />
    ),
    startedAt: () => dateView("startedAt"),
    completedAt: () => dateView("completedAt"),
  };

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={() => {
        back();
        onDismiss();
      }}
    >
      {editing ? (
        views[editing]()
      ) : (
        <Overview
          title={manga.title?.userPreferred || "Tracking"}
          form={form}
          onEdit={setEditing}
          onRemove={onRemove}
          canRemove={entryId != null}
          removing={removing}
        />
      )}
    </BottomSheet>
  );
}
