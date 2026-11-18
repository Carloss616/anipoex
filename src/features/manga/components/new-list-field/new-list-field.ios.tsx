import {
  Button,
  HStack,
  TextField,
  useNativeState,
  VStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonStyle,
  disabled,
  foregroundStyle,
  frame,
  glassEffect,
  labelStyle,
  onSubmit as onSubmitModifier,
  submitLabel,
} from "@expo/ui/swift-ui/modifiers";
import { useEffect } from "react";
import { Text, useFont } from "@/components/native/swift-ui/text";
import {
  HEIGHT,
  TextFieldGroup,
} from "@/components/native/swift-ui/text-field-group";
import { Icon, Icons, sfSymbol } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNewList } from "./hooks/use-new-list";
import type { NewListFieldProps } from "./new-list-field";

export function NewListField({
  names,
  onSubmit,
  label = "New list",
  initial = "",
  onCancel,
}: NewListFieldProps) {
  const { name, setName, busy, shownError, canAdd, add } = useNewList(
    names,
    onSubmit,
    initial,
  );
  const destructive = useThemeColor("destructive");
  const text = useNativeState(initial);
  const font = useFont();

  // Cleared after a save; typing is never rewritten.
  useEffect(() => {
    if (name === "") text.value = "";
  }, [name, text]);

  return (
    <VStack alignment="leading" spacing={8}>
      <HStack spacing={8}>
        <TextFieldGroup
          clearAction={() => setName("")}
          showClear={name !== ""}
          suffix={
            <Button
              onPress={() => void add()}
              modifiers={[
                buttonStyle("borderless"),
                accessibilityLabel("Save"),
                disabled(!canAdd),
              ]}
            >
              {busy ? (
                <Loader size="sm" />
              ) : (
                <Icon
                  name={onCancel ? Icons.check : Icons.add}
                  color="inherit"
                />
              )}
            </Button>
          }
        >
          <TextField
            text={text}
            placeholder={label}
            autoFocus={!!onCancel}
            onTextChange={setName}
            modifiers={[
              submitLabel("done"),
              onSubmitModifier(() => void add()),
              disabled(busy),
              font,
            ]}
          />
        </TextFieldGroup>
        {/* As the search bar's: the ✕ empties the field, this leaves it. */}
        {onCancel && (
          <Button
            label="Cancel"
            systemImage={sfSymbol(Icons.close)}
            onPress={onCancel}
            modifiers={[
              labelStyle("iconOnly"),
              buttonStyle("plain"),
              foregroundStyle("primary"),
              frame({ width: HEIGHT, height: HEIGHT }),
              glassEffect({
                glass: { variant: "regular", interactive: true },
                shape: "circle",
              }),
              disabled(busy),
            ]}
          />
        )}
      </HStack>
      {shownError && (
        <Text modifiers={[foregroundStyle(destructive)]}>{shownError}</Text>
      )}
    </VStack>
  );
}
