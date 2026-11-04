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
  submitLabel,
} from "@expo/ui/swift-ui/modifiers";
import { useEffect, useRef, useState } from "react";
import { useFont } from "@/components/native/swift-ui/text";
import {
  HEIGHT,
  TextFieldGroup,
} from "@/components/native/swift-ui/text-field-group";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { registerField } from "@/utils/focus";
import { EnsureHost } from "../host";
import { Icon, Icons, sfSymbol } from "../icon";
import type { SearchBarProps } from "./search-bar";

// `loading` has no slot in SwiftUI and stays web-only.
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
          <TextFieldGroup
            prefix={icon ?? <Icon name={Icons.search} size={17} muted />}
            suffix={accessory}
            clearLabel={clearLabel}
            clearAction={clear}
            showClear={isClearable && !!(value ?? query)}
          >
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
          </TextFieldGroup>
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
