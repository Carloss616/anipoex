import {
  Button,
  GlassEffectContainer,
  HStack,
  Image,
  TextField,
  type TextFieldRef,
  useNativeState,
} from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonStyle,
  contentShape,
  disabled as disabledModifier,
  foregroundStyle,
  frame,
  glassEffect,
  keyboardType,
  multilineTextAlignment,
  onSubmit,
  padding,
  shapes,
  submitLabel,
  textFieldStyle,
} from "@expo/ui/swift-ui/modifiers";
import type { NumberInputProps } from "panelui-native/components/number-input";
import { useEffect, useRef } from "react";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { dismissFocus, registerField } from "@/utils/focus";
import { EnsureHost } from "../host";
import { BUTTON_ICON_SIZE } from "../icon";
import { useStepRepeat } from "./hooks/use-step-repeat";

const HEIGHT = 44;

/**
 * iOS NumberInput: a SwiftUI `TextField` in a Liquid Glass capsule, with the
 * prefix and suffix inside it, between glass `−` and `+` circles that repeat
 * while held. The field
 * reports every keystroke, rewriting itself only when a typed number lands
 * outside the range, so ordinary typing is never interrupted. The keyboard is
 * the punctuation one, not the number pad: the pad has no return key, which
 * leaves no way to dismiss it.
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

  const stepButton = useStepRepeat(
    value,
    clamp,
    (next) => {
      dismissFocus();
      onValueChange?.(next);
    },
    isDisabled,
  );

  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
      <GlassEffectContainer spacing={8}>
        <HStack
          spacing={8}
          modifiers={isDisabled ? [disabledModifier(true)] : undefined}
        >
          {label ? <Text>{label}</Text> : null}
          <StepButton
            label="Decrement"
            systemImage="minus"
            disabled={value <= min}
            {...stepButton(-step)}
          />
          <HStack
            spacing={4}
            modifiers={[
              padding({ horizontal: 16 }),
              frame({
                maxWidth: Infinity,
                minHeight: HEIGHT,
                maxHeight: HEIGHT,
              }),
              glassEffect({
                glass: { variant: "regular", interactive: true },
                shape: "capsule",
              }),
            ]}
          >
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
                textFieldStyle("plain"),
                font,
              ]}
            />
            {typeof suffix === "string" ? <Text>{suffix}</Text> : suffix}
          </HStack>
          <StepButton
            label="Increment"
            systemImage="plus"
            disabled={value >= max}
            {...stepButton(step)}
          />
        </HStack>
      </GlassEffectContainer>
    </EnsureHost>
  );
}

function StepButton({
  label,
  systemImage,
  disabled,
  onPress,
  modifier,
}: {
  label: string;
  systemImage: "minus" | "plus";
  disabled: boolean;
} & ReturnType<ReturnType<typeof useStepRepeat>>) {
  return (
    <Button
      onPress={onPress}
      modifiers={[
        buttonStyle("plain"),
        foregroundStyle("primary"),
        glassEffect({
          glass: { variant: "regular", interactive: true },
          shape: "circle",
        }),
        accessibilityLabel(label),
        modifier,
        disabledModifier(disabled),
      ]}
    >
      {/* The label fills the circle: a plain button only takes touches on its label, and a bare minus glyph is ~2pt tall. */}
      <Image
        systemName={systemImage}
        size={BUTTON_ICON_SIZE}
        modifiers={[
          frame({ width: HEIGHT, height: HEIGHT }),
          contentShape(shapes.circle()),
        ]}
      />
    </Button>
  );
}
