import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { Input } from "panelui-web/input";
import type { KeyboardEvent, ReactNode } from "react";
import { Icon } from "../icon";
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
  /** A string renders in the platform's text, anything else as-is. */
  prefix?: ReactNode;
  /** A string renders in the platform's text, anything else as-is. */
  suffix?: ReactNode;
  /** @platform web */
  className?: string;
  /** @platform android */
  labelVariant?: "default" | "static";
  /** @platform android */
  placeholder?: string;
  /** @platform android */
  description?: string;
  /**
   * `display`: a large centered number typed in place, large buttons below (M3 Expressive).
   * @platform android
   */
  variant?: "field" | "display";
}

/** The buttons repeat while held; ↑/↓ step too. */
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
        <Icon name="minus" />
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
        <Icon name="plus" />
      </Button>
    </ButtonGroup>
  );
}
