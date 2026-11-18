import type { ReactNode } from "react";
import { useState } from "react";
import { Platform } from "react-native";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import type { MangaTracking } from "@/features/manga/hooks/use-tracking-entry";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import { CustomLists } from "./custom-lists";
import { DateView } from "./date-view";
import { useTrackingSheet } from "./hooks/use-tracking-sheet";
import type { Field } from "./overview";
import { Overview } from "./overview";
import { Progress } from "./progress";
import { Score } from "./score";
import { Status } from "./status";

// iOS draws these as a List, which has no height of its own to fit to.
const LIST_VIEWS: ReadonlySet<Field> = new Set(
  Platform.OS === "ios" ? ["status", "customLists"] : [],
);

export interface TrackingSheetProps {
  isPresented: boolean;
  manga: MangaDetail;
  tracking: MangaTracking;
  onDismiss: () => void;
}

/** Holds the entry; swaps between the overview and the field being edited. */
export function TrackingSheet({
  isPresented,
  manga,
  tracking,
  onDismiss,
}: TrackingSheetProps) {
  const sheet = useTrackingSheet({ isPresented, manga, tracking });
  const { form, total } = sheet;
  const [editing, setEditing] = useState<Field | null>(null);

  const back = () => setEditing(null);

  const commit = (next: TrackingForm) => {
    sheet.commit(next);
    back();
  };

  const onRemove = async () => {
    // On a failure the sheet stays open on the entry.
    if (!(await sheet.removeEntry())) return;
    back();
    onDismiss();
  };

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
      <Status
        form={form}
        mediaId={manga.id}
        total={total}
        onCancel={back}
        onConfirm={commit}
      />
    ),
    progress: () => (
      <Progress
        form={form}
        mediaId={manga.id}
        total={total}
        onCancel={back}
        onConfirm={commit}
      />
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
    customLists: () => (
      <CustomLists form={form} onCancel={back} onConfirm={commit} />
    ),
  };

  return (
    <BottomSheet
      isPresented={isPresented}
      contentKey={editing ?? "overview"}
      snapPoints={
        editing && LIST_VIEWS.has(editing) ? ["half", "full"] : undefined
      }
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
          canRemove={sheet.canRemove}
          removing={sheet.removing}
          canScore={sheet.canScore}
        />
      )}
    </BottomSheet>
  );
}
