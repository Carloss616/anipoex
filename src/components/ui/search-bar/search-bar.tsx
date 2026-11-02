import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { Input, type InputProps } from "panelui-web/input";
import type { ReactNode } from "react";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { BUTTON_ICON_SIZE, Icon, Icons } from "../icon";

// An empty field shows its placeholder: nothing to clear.
const HIDDEN_WHEN_EMPTY = "group-has-[input:placeholder-shown]/input:hidden";

/** Passed straight to the web `<input>`; native ignores them. */
type FieldProps = Pick<
  InputProps,
  | "ref"
  | "className"
  | "placeholder"
  | "autoFocus"
  | "autoCapitalize"
  | "inputMode"
  | "spellCheck"
  | "onFocus"
  | "onBlur"
>;

export interface SearchBarProps extends FieldProps {
  /** Set it to control the field; unset, the field keeps its own text. */
  value?: string;
  defaultValue?: string;
  /** Fires on every keystroke. */
  onChangeText?: (value: string) => void;
  /** The return key. Flushes `onDebouncedChange` first. */
  onSubmit?: (value: string) => void;
  /** How long typing pauses before `onDebouncedChange`, in ms. */
  debounce?: number;
  onDebouncedChange?: (value: string) => void;
  /** Fires after the ✕ empties the field, which keeps focus. */
  onClear?: () => void;
  /** Fires after Cancel empties the field (iOS). */
  onCancel?: () => void;
  /** Whether the ✕ appears once there is a query. */
  isClearable?: boolean;
  /** When iOS shows Cancel; on web the header owns it. */
  cancel?: "never" | "focus" | "always";
  clearLabel?: string;
  cancelLabel?: string;
  /** The leading glyph. */
  icon?: ReactNode;
  /** A control at the field's end: after the ✕ on web, before it on native. */
  accessory?: ReactNode;
}

/** Web SearchBar: panelui-web's `Input.Group` as a pill; Cancel is iOS-only. */
export function SearchBar({
  value,
  defaultValue,
  placeholder,
  onChangeText,
  onSubmit,
  debounce = 0,
  onDebouncedChange,
  onClear,
  isClearable = true,
  clearLabel = "Clear",
  icon,
  accessory,
  ref,
  className,
  autoFocus,
  autoCapitalize,
  inputMode,
  spellCheck,
  onFocus,
  onBlur,
}: SearchBarProps) {
  const debounced = useDebouncedCallback(onDebouncedChange, debounce);

  const change = (next: string) => {
    onChangeText?.(next);
    debounced.run(next);
  };

  return (
    <Input.Group className={cn("rounded-full", className)}>
      <Input.Addon>
        {icon ?? <Icon name={Icons.search} size={BUTTON_ICON_SIZE} />}
      </Input.Addon>
      <Input
        ref={ref}
        type="search"
        aria-label={placeholder ?? "Search"}
        placeholder={placeholder}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={(event) => change(event.target.value)}
        onKeyDown={(event) => {
          // An IME confirms its word with Enter: that isn't a submit.
          if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
          debounced.flush(event.currentTarget.value);
          onSubmit?.(event.currentTarget.value);
        }}
        enterKeyHint="search"
        autoFocus={autoFocus}
        autoCapitalize={autoCapitalize}
        inputMode={inputMode}
        spellCheck={spellCheck}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {accessory || isClearable ? (
        <Input.Addon
          align="end"
          // With only the ✕, the whole addon hides, padding included.
          className={cn(!accessory && HIDDEN_WHEN_EMPTY)}
        >
          {isClearable && (
            <Button
              variant="ghost"
              size="icon-sm"
              shape="pill"
              aria-label={clearLabel}
              className={HIDDEN_WHEN_EMPTY}
              onClick={(event) => {
                const input = event.currentTarget
                  .closest("[data-slot=input-group]")
                  ?.querySelector("input");
                if (!input) return;
                input.value = "";
                input.focus();
                onChangeText?.("");
                debounced.flush("");
                onClear?.();
              }}
            >
              <Icon name={Icons.close} size={BUTTON_ICON_SIZE} />
            </Button>
          )}
          {/* Last on web, so the ✕ coming and going doesn't move it. */}
          {accessory}
        </Input.Addon>
      ) : null}
    </Input.Group>
  );
}
