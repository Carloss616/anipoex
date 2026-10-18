import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Column } from "@/components/layout/column";
import { ScrollView } from "@/components/layout/scroll-view";
import { NumberInput } from "@/components/ui/number-input";
import { Typography } from "@/components/ui/typography";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import { ChangesPreview } from "../changes-preview";
import { Footer } from "../footer";
import { useProgress } from "./use-progress";

export interface ProgressProps {
  form: TrackingForm;
  /** Chapter count, when the source knows it — the ceiling and the `/total`. */
  total?: number | null;
  onCancel: () => void;
  onConfirm: (next: TrackingForm) => void;
}

/** One stepper, no scroller: the control is shorter than the sheet. */
export function Progress({ form, total, onCancel, onConfirm }: ProgressProps) {
  const { isLandscape } = useBreakpoint();
  const { value, step, next, dirty, changes } = useProgress(form, total);

  return (
    <Column className="py-4">
      <Typography type="h4" className="px-4" numberOfLines={1}>
        Progress
      </Typography>

      <ScrollView fill={isLandscape} className="w-full">
        <Column className="p-4">
          <NumberInput
            suffix={total ? `/${total}` : undefined}
            value={value}
            min={0}
            max={total ?? Number.MAX_SAFE_INTEGER}
            step={1}
            size="lg"
            onValueChange={step}
          />
        </Column>
      </ScrollView>

      <ChangesPreview changes={changes} />

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(next)}
        canConfirm={dirty}
      />
    </Column>
  );
}
