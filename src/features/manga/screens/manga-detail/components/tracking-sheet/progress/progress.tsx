import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { Input } from "panelui-web/input";
import { Sheet } from "panelui-web/sheet";
import type { KeyboardEvent } from "react";
import { BUTTON_ICON_SIZE, Icon } from "@/components/ui/icon";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import { ChangesPreview } from "../changes-preview";
import { Footer } from "../footer";
import { useHoldRepeat } from "./hooks/use-hold-repeat";
import { useProgress } from "./hooks/use-progress";

export interface ProgressProps {
  form: TrackingForm;
  /** Chapter count, when the source knows it — the ceiling and the `/total`. */
  total?: number | null;
  onCancel: () => void;
  onConfirm: (next: TrackingForm) => void;
}

const STEPS: Record<string, number> = { ArrowUp: 1, ArrowDown: -1 };

/** One stepper, no scroller: the control is shorter than the sheet. */
export function Progress({ form, total, onCancel, onConfirm }: ProgressProps) {
  const { value, step, next, dirty, changes } = useProgress(form, total);
  const max = total ?? Number.MAX_SAFE_INTEGER;
  const clamp = (to: number) => Math.min(Math.max(to, 0), max);
  const set = (to: number) => step(clamp(to));
  const stepButton = useHoldRepeat(value, clamp, step);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const direction = STEPS[event.key];
    if (!direction) return;
    event.preventDefault();
    set(value + direction);
  };

  return (
    <>
      <Sheet.Header title="Progress" />

      <Sheet.Body>
        <ButtonGroup aria-label="Progress" className="w-full">
          <Button
            variant="outline"
            size="icon"
            disabled={value <= 0}
            {...stepButton(-1)}
            aria-label="Decrease"
          >
            <Icon name="minus" size={BUTTON_ICON_SIZE} />
          </Button>
          <Input
            inputMode="numeric"
            aria-label="Chapters read"
            className="text-center tabular-nums"
            value={value}
            onChange={(event) =>
              set(Number.parseInt(event.target.value, 10) || 0)
            }
            onKeyDown={onKeyDown}
          />
          {total ? <ButtonGroup.Text>/{total}</ButtonGroup.Text> : null}
          <Button
            variant="outline"
            size="icon"
            disabled={value >= max}
            {...stepButton(1)}
            aria-label="Increase"
          >
            <Icon name="plus" size={BUTTON_ICON_SIZE} />
          </Button>
        </ButtonGroup>
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
