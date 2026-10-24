import {
  IconButton,
  Row,
  Shape,
  TextField,
  type TextFieldRef,
  useNativeState,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, semantics } from "@expo/ui/jetpack-compose/modifiers";
import { useEffect, useRef, useState } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useFontFamily } from "@/hooks/use-font";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { registerField } from "@/utils/focus";
import { EnsureHost } from "../host";
import { BUTTON_ICON_SIZE, Icon, Icons } from "../icon";
import type { SearchBarProps } from "./search-bar";

/**
 * Android SearchBar: PanelUI's props, drawn as an M3 search input — a pill
 * `TextField` with a search glyph and a clear button.
 * Cancel and loading have no slot to land in and stay iOS/web-only.
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
  isClearable = true,
  clearLabel = "Clear",
  icon,
  accessory,
}: SearchBarProps) {
  const text = useNativeState(value ?? defaultValue ?? "");
  const [query, setQuery] = useState(text.value);
  const debounced = useDebouncedCallback(onDebouncedChange, debounce);
  const field = useRef<TextFieldRef>(null);
  const fontFamily = useFontFamily("normal");
  const m3 = useThemeM3Colors();

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

  return (
    <EnsureHost matchContents={{ vertical: true }} className="w-full">
      <TextField
        ref={field}
        value={text}
        singleLine
        shape={Shape.Pill({})}
        colors={{
          focusedContainerColor: m3.surfaceContainerHigh,
          unfocusedContainerColor: m3.surfaceContainerHigh,
          focusedIndicatorColor: "transparent",
          unfocusedIndicatorColor: "transparent",
        }}
        keyboardOptions={{ imeAction: "search" }}
        keyboardActions={{
          onSearch: (next) => {
            debounced.flush(next);
            onSubmit?.(next);
          },
        }}
        textStyle={{ fontFamily }}
        onValueChange={change}
        modifiers={[fillMaxWidth()]}
      >
        {placeholder ? (
          <TextField.Placeholder>
            <Text>{placeholder}</Text>
          </TextField.Placeholder>
        ) : null}
        <TextField.LeadingIcon>
          {icon ?? (
            <Icon name={Icons.search} size={BUTTON_ICON_SIZE} color="inherit" />
          )}
        </TextField.LeadingIcon>
        {accessory || (isClearable && (value ?? query)) ? (
          <TextField.TrailingIcon>
            <Row verticalAlignment="center">
              {accessory}
              {isClearable && (value ?? query) ? (
                <IconButton
                  onClick={clear}
                  modifiers={[semantics({ contentDescription: clearLabel })]}
                >
                  <Icon
                    name={Icons.close}
                    size={BUTTON_ICON_SIZE}
                    color="inherit"
                  />
                </IconButton>
              ) : null}
            </Row>
          </TextField.TrailingIcon>
        ) : null}
      </TextField>
    </EnsureHost>
  );
}
