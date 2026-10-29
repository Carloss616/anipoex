import { Sheet } from "panelui-web/sheet";
import { SHEET_INSET } from "@/components/ui/bottom-sheet";
import { NumberInput } from "@/components/ui/number-input";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import { ChangesPreview } from "../changes-preview";
import { Footer } from "../footer";
import { useProgress } from "./hooks/use-progress";

export interface ProgressProps {
  form: TrackingForm;
  /** Chapter count, when the source knows it — the ceiling and the `/total`. */
  total?: number | null;
  onCancel: () => void;
  onConfirm: (next: TrackingForm) => void;
}

/** One stepper, no scroller: the control is shorter than the sheet. */
export function Progress({ form, total, onCancel, onConfirm }: ProgressProps) {
  const { value, step, next, dirty, changes } = useProgress(form, total);

  return (
    <>
      <Sheet.Header title="Progress" className={SHEET_INSET.header} />

      <Sheet.Body className={SHEET_INSET.body}>
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
