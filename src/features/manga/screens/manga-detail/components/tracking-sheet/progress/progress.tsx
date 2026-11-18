import { Sheet } from "panelui-web/sheet";
import { NumberInput } from "@/components/ui/number-input";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import { ChangesPreview } from "../changes-preview";
import { Footer } from "../footer";
import { useProgress } from "./hooks/use-progress";

export interface ProgressProps {
  form: TrackingForm;
  /** The manga, whose list activity dates a Completed. */
  mediaId: number;
  /** Chapter count, when the source knows it — the ceiling and the `/total`. */
  total?: number | null;
  onCancel: () => void;
  onConfirm: (next: TrackingForm) => void;
}

/** One stepper, no scroller: the control is shorter than the sheet. */
export function Progress({
  form,
  mediaId,
  total,
  onCancel,
  onConfirm,
}: ProgressProps) {
  const { value, step, next, dirty, changes } = useProgress(
    form,
    mediaId,
    total,
  );

  return (
    <>
      <Sheet.Header title="Progress" className="p-4" />

      <Sheet.Body className="px-4 pb-0">
        <NumberInput
          label="Chapters read"
          suffix={total ? `/${total}` : undefined}
          value={value}
          min={0}
          max={total ?? Number.MAX_SAFE_INTEGER}
          onValueChange={step}
          className="w-full"
        />
        <ChangesPreview changes={changes} />
      </Sheet.Body>

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(next)}
        canConfirm={dirty}
      />
    </>
  );
}
