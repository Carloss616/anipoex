import {
  HStack,
  Stepper,
  TextField,
  type TextFieldRef,
  useNativeState,
} from "@expo/ui/swift-ui";
import {
  disabled as disabledModifier,
  keyboardType,
  labelsHidden,
  multilineTextAlignment,
  onSubmit,
  submitLabel,
  textFieldStyle,
} from "@expo/ui/swift-ui/modifiers";
import type { NumberInputProps } from "panelui-native/components/number-input";
import { useEffect, useRef } from "react";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { dismissFocus, registerField } from "@/utils/focus";
import { EnsureHost } from "../host";

/**
 * iOS NumberInput: a SwiftUI `TextField` beside a label-less `Stepper`. The
 * field reports every keystroke, rewriting itself only when a typed number
 * lands outside the range, so ordinary typing is never interrupted. The
 * keyboard is the punctuation one, not the number pad: the pad has no return
 * key, which leaves no way to dismiss it. The field takes the width the row
 * leaves it, as a SwiftUI `TextField` does.
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/stepper/
 */
export function NumberInput({
  value = 0,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  onValueChange,
  disabled: isDisabled = false,
  label = "",
  suffix,
  prefix,
}: NumberInputProps) {
  const text = useNativeState(String(value));
  const font = useFont();
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

  const commit = (next: string) => {
    const parsed = Number.parseInt(next, 10);
    if (Number.isNaN(parsed)) return;
    const clamped = clamp(parsed);
    if (clamped !== parsed) text.value = String(clamped);
    if (clamped !== value) onValueChange?.(clamped);
  };

  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
      <HStack
        spacing={8}
        modifiers={isDisabled ? [disabledModifier(true)] : undefined}
      >
        <Stepper
          label={label}
          value={value}
          min={min}
          max={max}
          step={step}
          onValueChange={(next) => {
            dismissFocus();
            onValueChange?.(clamp(next));
          }}
          modifiers={[...(label ? [] : [labelsHidden()]), font]}
        />
        {typeof prefix === "string" ? <Text>{prefix}</Text> : prefix}
        <TextField
          ref={field}
          text={text}
          onTextChange={commit}
          modifiers={[
            keyboardType("numbers-and-punctuation"),
            submitLabel("done"),
            onSubmit(() => {
              field.current?.blur();
            }),
            multilineTextAlignment("trailing"),
            textFieldStyle("roundedBorder"),
            font,
          ]}
        />
        {typeof suffix === "string" ? <Text>{suffix}</Text> : suffix}
      </HStack>
    </EnsureHost>
  );
}
