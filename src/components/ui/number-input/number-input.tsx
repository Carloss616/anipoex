import {
  type NumberInputProps,
  NumberInput as PanelNumberInput,
} from "panelui-native/components/number-input";
import { cn } from "panelui-native/utils/cn";
import type { KeyboardEvent } from "react";

export * from "panelui-native/components/number-input";

const STEPS: Record<string, number> = { ArrowUp: 1, ArrowDown: -1 };

/** PanelUI's NumberInput with hover on its − and +, and ↑/↓ stepping the field. */
export function NumberInput({ className, ...props }: NumberInputProps) {
  const {
    min = -Infinity,
    max = Infinity,
    step = 1,
    value,
    defaultValue,
    disabled,
    formatValue,
    onValueChange,
  } = props;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const field = event.target;
    const direction = STEPS[event.key];
    if (!direction || disabled || !(field instanceof HTMLInputElement)) return;
    event.preventDefault();
    const typed = Number.parseFloat(field.value);
    const from = Number.isNaN(typed) ? (value ?? defaultValue ?? 0) : typed;
    const decimals = String(step).split(".")[1]?.length ?? 0;
    const next = Math.min(
      Math.max(Number((from + direction * step).toFixed(decimals)), min),
      max,
    );
    // PanelUI shows its own text state while focused, so the field gets it as typed input.
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(field, formatValue?.(next) ?? String(next));
    field.dispatchEvent(new Event("input", { bubbles: true }));
    onValueChange?.(next);
  };

  return (
    // Capture: react-native-web's TextInput stops every keydown from bubbling.
    <div onKeyDownCapture={onKeyDown} className="contents">
      <PanelNumberInput
        {...props}
        className={cn(
          // The bordered box takes no data-*, and PanelUI's buttons no class.
          "attached-row",
          "*:[[role=button]]:transition-colors",
          "*:[[role=button]]:hover:bg-secondary/90",
          "*:[[role=button]]:active:bg-accent",
          className,
        )}
      />
    </div>
  );
}
