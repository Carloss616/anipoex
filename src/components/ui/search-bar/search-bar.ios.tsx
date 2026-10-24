import {
  Button,
  GlassEffectContainer,
  HStack,
  TextField,
  type TextFieldRef,
  useNativeState,
} from "@expo/ui/swift-ui";
import {
  Animation,
  animation,
  autocorrectionDisabled,
  buttonStyle,
  foregroundStyle,
  frame,
  glassEffect,
  labelStyle,
  onSubmit as onSubmitModifier,
  padding,
  submitLabel,
} from "@expo/ui/swift-ui/modifiers";
import { useEffect, useRef, useState } from "react";
import { useFont } from "@/components/native/swift-ui/text";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { registerField } from "@/utils/focus";
import { EnsureHost } from "../host";
import { Icon, Icons, sfSymbol } from "../icon";
import type { SearchBarProps } from "./search-bar";

const HEIGHT = 48;

/**
 * iOS SearchBar: PanelUI's props, drawn in SwiftUI — a `TextField` in a Liquid
 * Glass capsule with a search glyph and a clear button, and a glass circle
 * beside it for `cancel`. Loading has no slot to land in and stays web-only.
 */
export function SearchBar({
  value,
  defaultValue,
  placeholder,
  onChangeText,
  debounce = 0,
  onDebouncedChange,
  onSubmit,
  onClear,
  onCancel,
  isClearable = true,
  cancel = "never",
  clearLabel = "Clear",
  cancelLabel = "Cancel",
  icon,
  accessory,
}: SearchBarProps) {
  const text = useNativeState(value ?? defaultValue ?? "");
  const [query, setQuery] = useState(text.value);
  const debounced = useDebouncedCallback(onDebouncedChange, debounce);
  const [focused, setFocused] = useState(false);
  const field = useRef<TextFieldRef>(null);
  const font = useFont();
  const showCancel = cancel === "always" || (cancel === "focus" && focused);

  useEffect(
    () => (field.current ? registerField(field.current) : undefined),
    [],
  );

  // Only an outside clear is mirrored, so typing is never rewritten.
  useEffect(() => {
    if (value === "") text.value = "";
  }, [value, text]);

  const change = (next: string) => {
    setQuery(next);
    onChangeText?.(next);
    debounced.run(next);
  };

  const clear = () => {
    text.value = "";
    change("");
    onClear?.();
  };

  const dismiss = () => {
    text.value = "";
    change("");
    void field.current?.blur();
    onCancel?.();
  };

  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
      <GlassEffectContainer spacing={8}>
        <HStack
          spacing={8}
          modifiers={[
            animation(
              Animation.spring({ duration: 0.3, bounce: 0 }),
              showCancel,
            ),
          ]}
        >
          <HStack
            spacing={8}
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
            {icon ?? <Icon name={Icons.search} size={17} muted />}
            <TextField
              ref={field}
              text={text}
              placeholder={placeholder}
              onTextChange={change}
              onFocusChange={setFocused}
              modifiers={[
                submitLabel("search"),
                onSubmitModifier(() => {
                  debounced.flush(text.value);
                  onSubmit?.(text.value);
                }),
                autocorrectionDisabled(),
                font,
              ]}
            />
            {accessory}
            {isClearable && (value ?? query) ? (
              <Button
                label={clearLabel}
                systemImage="xmark.circle.fill"
                onPress={clear}
                modifiers={[
                  labelStyle("iconOnly"),
                  buttonStyle("plain"),
                  foregroundStyle("secondary"),
                ]}
              />
            ) : null}
          </HStack>
          {showCancel ? (
            <Button
              label={cancelLabel}
              systemImage={sfSymbol(Icons.close)}
              onPress={dismiss}
              modifiers={[
                labelStyle("iconOnly"),
                buttonStyle("plain"),
                foregroundStyle("primary"),
                frame({ width: HEIGHT, height: HEIGHT }),
                glassEffect({
                  glass: { variant: "regular", interactive: true },
                  shape: "circle",
                }),
              ]}
            />
          ) : null}
        </HStack>
      </GlassEffectContainer>
    </EnsureHost>
  );
}
