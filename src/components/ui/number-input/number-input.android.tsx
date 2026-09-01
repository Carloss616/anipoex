import AddIcon from "@expo/material-symbols/add.xml";
import RemoveIcon from "@expo/material-symbols/remove.xml";
import {
  OutlinedTextField,
  type TextFieldRef,
  useNativeState,
} from "@expo/ui/jetpack-compose";
import { weight } from "@expo/ui/jetpack-compose/modifiers";
import type { NumberInputProps } from "panelui-native/components/number-input";
import { useEffect, useRef } from "react";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { useFontFamily } from "@/hooks/use-font";
import { dismissFocus, registerField } from "@/utils/focus";
import { Button } from "../button";
import { EnsureHost } from "../host";
import { Icon } from "../icon";
import { Typography } from "../typography";

/**
 * Android NumberInput: M3 has no stepper, so it's two icon buttons around a
 * field that reports every keystroke, rewriting itself only when a typed
 * number lands outside the range, so ordinary typing is never interrupted.
 * The IME carries a Done key, the only way out of a numeric keyboard.
 * `label` is dropped: the sheet renders the caption above the control, and
 * Compose exposes no way to set an accessibility name without one.
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/textfield/
 */
export function NumberInput({
  value = 0,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  onValueChange,
  disabled = false,
  label,
  labelVariant = "default",
  placeholder,
  description,
  prefix,
  suffix,
}: NumberInputProps) {
  const text = useNativeState(String(value));
  const fontFamily = useFontFamily("normal");
  const field = useRef<TextFieldRef>(null);
  const clamp = (next: number) => Math.min(Math.max(next, min), max);

  useEffect(
    () => (field.current ? registerField(field.current) : undefined),
    [],
  );

  // An empty field is a number half-typed, not a zero — leave it be.
  useEffect(() => {
    if (text.value !== "" && Number.parseInt(text.value, 10) !== value)
      text.value = String(value);
  }, [value, text]);

  const emit = (next: number) => {
    dismissFocus();
    onValueChange?.(clamp(next));
  };

  const commit = (next: string) => {
    const parsed = Number.parseInt(next, 10);
    if (Number.isNaN(parsed)) return;
    const clamped = clamp(parsed);
    if (clamped !== parsed) text.value = String(clamped);
    if (clamped !== value) onValueChange?.(clamped);
  };

  const content = (
    <Row alignment="center" className="gap-2">
      <Button
        disabled={disabled || value <= min}
        onPress={() => emit(value - step)}
        variant="secondary"
        size="icon"
      >
        <Icon name={RemoveIcon} />
      </Button>
      <OutlinedTextField
        ref={field}
        modifiers={[weight(1)]}
        value={text}
        enabled={!disabled}
        singleLine
        keyboardOptions={{ keyboardType: "number", imeAction: "done" }}
        keyboardActions={{
          onDone: () => {
            field.current?.blur();
          },
        }}
        textStyle={{ fontFamily }}
        onValueChange={commit}
      >
        {labelVariant === "default" && label && (
          <OutlinedTextField.Label>
            <Typography>{label}</Typography>
          </OutlinedTextField.Label>
        )}
        {placeholder && (
          <OutlinedTextField.Placeholder>
            <Typography>{placeholder}</Typography>
          </OutlinedTextField.Placeholder>
        )}
        {description && (
          <OutlinedTextField.SupportingText>
            <Typography type="body-xs" muted>
              {description}
            </Typography>
          </OutlinedTextField.SupportingText>
        )}
        {prefix && (
          <OutlinedTextField.Prefix>
            {typeof prefix === "string" ? (
              <Typography>{prefix}</Typography>
            ) : (
              prefix
            )}
          </OutlinedTextField.Prefix>
        )}
        {suffix && (
          <OutlinedTextField.Suffix>
            {typeof suffix === "string" ? (
              <Typography>{suffix}</Typography>
            ) : (
              suffix
            )}
          </OutlinedTextField.Suffix>
        )}
      </OutlinedTextField>
      <Button
        disabled={disabled || value >= max}
        onPress={() => emit(value + step)}
        variant="secondary"
        size="icon"
      >
        <Icon name={AddIcon} />
      </Button>
    </Row>
  );

  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
      {labelVariant === "static" && label ? (
        <Column className="gap-2">
          <Typography weight="medium">{label}</Typography>
          {content}
        </Column>
      ) : (
        content
      )}
    </EnsureHost>
  );
}
