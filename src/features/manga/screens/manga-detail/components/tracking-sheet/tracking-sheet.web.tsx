import { Sheet } from "panelui-web/sheet";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { noop } from "@/utils/utils";
import { DateView } from "./date-view";
import { useTrackingSheet } from "./hooks/use-tracking-sheet";
import { Overview } from "./overview";
import { Progress } from "./progress";
import { Score } from "./score";
import { Status } from "./status";
import type { TrackingSheetProps } from "./tracking-sheet";

/**
 * The overview, with each field's view a Sheet.Next its cell opens. A view's
 * footer buttons are Sheet.Close, so Cancel needs no handler of its own.
 */
export function TrackingSheet({
  isPresented,
  manga,
  tracking,
  onDismiss,
}: TrackingSheetProps) {
  const sheet = useTrackingSheet({ isPresented, manga, tracking });
  const { form, commit, total } = sheet;

  const onRemove = async () => {
    if (await sheet.removeEntry()) onDismiss();
  };

  const dateView = (key: "startedAt" | "completedAt") => (
    <DateView
      title={key === "startedAt" ? "Start date" : "Finish date"}
      value={form[key]}
      onCancel={noop}
      onConfirm={(date) => commit({ ...form, [key]: date })}
    />
  );

  return (
    <BottomSheet isPresented={isPresented} onDismiss={onDismiss}>
      <Overview
        title={manga.title?.userPreferred || "Tracking"}
        form={form}
        onEdit={noop}
        onRemove={onRemove}
        canRemove={sheet.canRemove}
        removing={sheet.removing}
        canScore={sheet.canScore}
      />
      <Sheet.Next name="status" showClose={false}>
        <Status form={form} total={total} onCancel={noop} onConfirm={commit} />
      </Sheet.Next>
      <Sheet.Next name="progress" showClose={false}>
        <Progress
          form={form}
          total={total}
          onCancel={noop}
          onConfirm={commit}
        />
      </Sheet.Next>
      <Sheet.Next name="score" showClose={false}>
        <Score
          value={form.score}
          onCancel={noop}
          onConfirm={(score) => commit({ ...form, score })}
        />
      </Sheet.Next>
      <Sheet.Next name="startedAt" showClose={false}>
        {dateView("startedAt")}
      </Sheet.Next>
      <Sheet.Next name="completedAt" showClose={false}>
        {dateView("completedAt")}
      </Sheet.Next>
    </BottomSheet>
  );
}
