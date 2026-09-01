import {
  Stepper,
  TextField,
  type TextFieldRef,
  useNativeState,
} from "@expo/ui/swift-ui";
import {
  disabled as disabledModifier,
  font,
  frame,
  keyboardType,
  labelsHidden,
  multilineTextAlignment,
  onSubmit,
  submitLabel,
  textFieldStyle,
} from "@expo/ui/swift-ui/modifiers";
import type { NumberInputProps } from "panelui-native/components/number-input";
import { cn } from "panelui-native/utils/cn";
import { useEffect, useRef } from "react";
import { useResolveClassNames } from "uniwind";
import { Row } from "@/components/layout/row";
import { useFontFamily } from "@/hooks/use-font";
import { dismissFocus, registerField } from "@/utils/focus";
import { resolveFill } from "@/utils/resolve-fill";
import { EnsureHost } from "../host";
import { Typography } from "../typography";
import { TYPOGRAPHY_IOS } from "../typography/constants";

/**
 * iOS NumberInput: a SwiftUI `TextField` beside a label-less `Stepper`. The
 * field reports every keystroke, rewriting itself only when a typed number
 * lands outside the range, so ordinary typing is never interrupted. The
 * keyboard is the punctuation one, not the number pad: the pad has no return
 * key, which leaves no way to dismiss it.
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
  className = "",
  containerClassName,
  suffix,
  prefix,
}: NumberInputProps) {
  const text = useNativeState(String(value));
  const fontFamily = useFontFamily("normal");
  const field = useRef<TextFieldRef>(null);
  const clamp = (next: number) => Math.min(Math.max(next, min), max);
  const style = useResolveClassNames(className) ?? {};

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
      <Row
        alignment="center"
        modifiers={isDisabled ? [disabledModifier(true)] : undefined}
        className={cn("gap-2", containerClassName)}
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
          modifiers={[
            ...(label ? [] : [labelsHidden()]),
            font({ ...TYPOGRAPHY_IOS.body, family: fontFamily }),
          ]}
        />
        {typeof prefix === "string" ? (
          <Typography>{prefix}</Typography>
        ) : (
          prefix
        )}
        <TextField
          ref={field}
          text={text}
          onTextChange={commit}
          modifiers={[
            ...(resolveFill({ style }).modifiers ?? [frame({ width: 50 })]),
            keyboardType("numbers-and-punctuation"),
            submitLabel("done"),
            onSubmit(() => {
              field.current?.blur();
            }),
            multilineTextAlignment("trailing"),
            textFieldStyle("roundedBorder"),
            font({ ...TYPOGRAPHY_IOS.body, family: fontFamily }),
          ]}
        />
        {typeof suffix === "string" ? (
          <Typography>{suffix}</Typography>
        ) : (
          suffix
        )}
      </Row>
    </EnsureHost>
  );
}
