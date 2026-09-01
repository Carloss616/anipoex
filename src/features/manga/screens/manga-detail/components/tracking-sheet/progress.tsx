import { Spacer } from "@expo/ui";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useState } from "react";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { Typography } from "@/components/ui/typography";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import {
  describeChanges,
  setProgress,
} from "@/features/manga/utils/tracking-form";
import { ChangesPreview } from "./changes-preview";

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
  const [today] = useState(() => new Date());
  const [value, setValue] = useState(form.progress);

  const next = setProgress(form, value, total, today);
  // Nothing to apply, nothing to announce: the preview and OK rise together.
  const dirty = next.progress !== form.progress;
  const changes = dirty ? describeChanges(form, next, "progress", total) : [];

  return (
    <Column className="py-4 android:pt-0">
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
            onValueChange={setValue}
            className="ios:w-full"
          />
        </Column>
      </ScrollView>

      <ChangesPreview changes={changes} />

      <Row alignment="center" className="gap-4 px-4">
        <Spacer flexible />
        <Button variant="ghost" cancelRole onPress={onCancel}>
          Cancel
        </Button>
        <Button disabled={!dirty} onPress={() => onConfirm(next)}>
          OK
        </Button>
      </Row>
    </Column>
  );
}
