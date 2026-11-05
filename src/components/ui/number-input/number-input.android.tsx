import AddIcon from "@expo/material-symbols/add.xml";
import RemoveIcon from "@expo/material-symbols/remove.xml";
import {
  BasicTextField,
  Column,
  FilledIconButton,
  FilledTonalIconButton,
  OutlinedTextField,
  Row,
  Shape,
  type TextFieldRef,
  useNativeState,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, size, weight } from "@expo/ui/jetpack-compose/modifiers";
import { useEffect, useRef } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { useFontFamily } from "@/hooks/use-font";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { dismissFocus, registerField } from "@/utils/focus";
import { EnsureHost } from "../host";
import { Icon } from "../icon";
import { useStepRepeat } from "./hooks/use-step-repeat";
import type { NumberInputProps } from "./number-input";

/** M3 Expressive's large icon button: 56dp tall, + wider as the main action. */
const LARGE = { height: 56, minus: 64, plus: 96, radius: 18 };
const corners = (r: number) =>
  Shape.RoundedCorner({
    cornerRadii: { topStart: r, topEnd: r, bottomStart: r, bottomEnd: r },
  });

/**
 * M3 has no stepper: two icon buttons that repeat while held, around a field
 * that rewrites itself only when a typed number lands outside the range, so
 * typing is never interrupted. The IME's Done key is the only way out of a
 * numeric keyboard.
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
  variant = "field",
}: NumberInputProps) {
  const text = useNativeState(String(value));
  const fontFamily = useFontFamily("normal");
  const m3 = useThemeM3Colors();
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

  const stepButton = useStepRepeat(
    value,
    clamp,
    (next) => {
      dismissFocus();
      onValueChange?.(next);
    },
    disabled,
  );
  const decrement = stepButton(-step);
  const increment = stepButton(step);

  const commit = (next: string) => {
    const parsed = Number.parseInt(next, 10);
    if (Number.isNaN(parsed)) return;
    const clamped = clamp(parsed);
    if (clamped !== parsed) text.value = String(clamped);
    if (clamped !== value) onValueChange?.(clamped);
  };

  const keyboard = {
    keyboardOptions: { keyboardType: "number", imeAction: "done" },
    keyboardActions: { onDone: () => field.current?.blur() },
  } as const;

  if (variant === "display") {
    return (
      <EnsureHost matchContents={{ vertical: true }} className="w-full">
        <Column
          horizontalAlignment="center"
          verticalArrangement={{ spacedBy: 16 }}
          modifiers={[fillMaxWidth()]}
        >
          <Column horizontalAlignment="center" modifiers={[fillMaxWidth()]}>
            <BasicTextField
              ref={field}
              value={text}
              enabled={!disabled}
              singleLine
              {...keyboard}
              // displayLarge, the M3 type scale's largest.
              textStyle={{
                fontFamily,
                fontSize: 57,
                lineHeight: 64,
                textAlign: "center",
                color: m3.onSurface,
              }}
              onValueChange={commit}
              modifiers={[fillMaxWidth()]}
            />
            {description && (
              <Text
                style={{ typography: "bodyMedium" }}
                color={m3.onSurfaceVariant}
              >
                {description}
              </Text>
            )}
          </Column>
          <Row
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: 12 }}
          >
            <FilledTonalIconButton
              enabled={!disabled && value > min}
              onClick={decrement.onPress}
              shape={corners(LARGE.radius)}
              modifiers={[size(LARGE.minus, LARGE.height), decrement.modifier]}
            >
              <Icon
                name={RemoveIcon}
                accessibilityLabel="Decrease"
                color="inherit"
              />
            </FilledTonalIconButton>
            <FilledIconButton
              enabled={!disabled && value < max}
              onClick={increment.onPress}
              shape={corners(LARGE.height / 2)}
              modifiers={[size(LARGE.plus, LARGE.height), increment.modifier]}
            >
              <Icon
                name={AddIcon}
                accessibilityLabel="Increase"
                color="inherit"
              />
            </FilledIconButton>
          </Row>
        </Column>
      </EnsureHost>
    );
  }

  const content = (
    <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 8 }}>
      <FilledTonalIconButton
        enabled={!disabled && value > min}
        onClick={decrement.onPress}
        modifiers={[decrement.modifier]}
      >
        <Icon name={RemoveIcon} accessibilityLabel="Decrease" color="inherit" />
      </FilledTonalIconButton>
      <OutlinedTextField
        ref={field}
        modifiers={[weight(1)]}
        value={text}
        enabled={!disabled}
        singleLine
        {...keyboard}
        textStyle={{ fontFamily, textAlign: "right" }}
        onValueChange={commit}
      >
        {labelVariant === "default" && label && (
          <OutlinedTextField.Label>
            <Text>{label}</Text>
          </OutlinedTextField.Label>
        )}
        {placeholder && (
          <OutlinedTextField.Placeholder>
            <Text>{placeholder}</Text>
          </OutlinedTextField.Placeholder>
        )}
        {description && (
          <OutlinedTextField.SupportingText>
            <Text
              style={{ typography: "bodySmall" }}
              color={m3.onSurfaceVariant}
            >
              {description}
            </Text>
          </OutlinedTextField.SupportingText>
        )}
        {prefix && (
          <OutlinedTextField.Prefix>
            {typeof prefix === "string" ? <Text>{prefix}</Text> : prefix}
          </OutlinedTextField.Prefix>
        )}
        {suffix && (
          <OutlinedTextField.Suffix>
            {typeof suffix === "string" ? <Text>{suffix}</Text> : suffix}
          </OutlinedTextField.Suffix>
        )}
      </OutlinedTextField>
      <FilledTonalIconButton
        enabled={!disabled && value < max}
        onClick={increment.onPress}
        modifiers={[increment.modifier]}
      >
        <Icon name={AddIcon} accessibilityLabel="Increase" color="inherit" />
      </FilledTonalIconButton>
    </Row>
  );

  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
      {labelVariant === "static" && label ? (
        <Column verticalArrangement={{ spacedBy: 8 }}>
          <Text style={{ fontWeight: "500" }}>{label}</Text>
          {content}
        </Column>
      ) : (
        content
      )}
    </EnsureHost>
  );
}
