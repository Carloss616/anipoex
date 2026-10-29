import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { Input } from "panelui-web/input";
import type { KeyboardEvent, ReactNode } from "react";
import { BUTTON_ICON_SIZE, Icon } from "../icon";
import { useHoldRepeat } from "./hooks/use-hold-repeat";

const STEPS: Record<string, number> = { ArrowUp: 1, ArrowDown: -1 };

export interface NumberInputProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
  label?: string;
  /** A bare string is wrapped in the platform's text; anything else renders as-is. */
  prefix?: ReactNode;
  /** A bare string is wrapped in the platform's text; anything else renders as-is. */
  suffix?: ReactNode;
  /** @platform web */
  className?: string;
  /** @platform android */
  labelVariant?: "default" | "static";
  /** @platform android */
  placeholder?: string;
  /** @platform android */
  description?: string;
}

/**
 * Web NumberInput: panelui-web's `ButtonGroup` of −, the field with `prefix`
 * and `suffix` as addons, and +. The buttons repeat while held; ↑/↓ step too.
 */
export function NumberInput({
  value = 0,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  onValueChange,
  disabled = false,
  label,
  prefix,
  suffix,
  className,
}: NumberInputProps) {
  const clamp = (to: number) => Math.min(Math.max(to, min), max);
  const set = (to: number) => onValueChange?.(clamp(to));
  const stepButton = useHoldRepeat(value, clamp, set);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const direction = STEPS[event.key];
    if (!direction) return;
    event.preventDefault();
    set(value + direction * step);
  };

  return (
    <ButtonGroup className={className}>
      <Button
        variant="ghost"
        size="icon"
        disabled={disabled || value <= min}
        {...stepButton(-step)}
        aria-label="Decrease"
      >
        <Icon name="minus" size={BUTTON_ICON_SIZE} />
      </Button>
      <Input.Group className="flex-1">
        {prefix != null && <Input.Addon>{prefix}</Input.Addon>}
        <Input
          inputMode="numeric"
          aria-label={label}
          className="text-center tabular-nums"
          value={value}
          disabled={disabled}
          onChange={(event) => {
            const typed = Number.parseInt(event.target.value, 10);
            set(Number.isNaN(typed) ? min : typed);
          }}
          onKeyDown={onKeyDown}
        />
        {suffix != null && (
          <Input.Addon align="end" className="tabular-nums">
            {suffix}
          </Input.Addon>
        )}
      </Input.Group>
      <Button
        variant="ghost"
        size="icon"
        disabled={disabled || value >= max}
        {...stepButton(step)}
        aria-label="Increase"
      >
        <Icon name="plus" size={BUTTON_ICON_SIZE} />
      </Button>
    </ButtonGroup>
  );
}
