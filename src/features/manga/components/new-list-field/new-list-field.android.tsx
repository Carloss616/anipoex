import {
  IconButton,
  OutlinedTextField,
  Row,
  TextButton,
  useNativeState,
} from "@expo/ui/jetpack-compose";
import { semantics, weight } from "@expo/ui/jetpack-compose/modifiers";
import { useEffect } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { useFontFamily } from "@/hooks/use-font";
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
  const text = useNativeState(initial);
  // A rename starts with the name selected, as on web: typing replaces it.
  const selection = useNativeState({ start: 0, end: initial.length });
  const fontFamily = useFontFamily("normal");

  // Cleared after a save; typing is never rewritten.
  useEffect(() => {
    if (name === "") text.value = "";
  }, [name, text]);

  return (
    <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 4 }}>
      <OutlinedTextField
        value={text}
        selection={selection}
        singleLine
        enabled={!busy}
        autoFocus={!!onCancel}
        keyboardOptions={{ imeAction: "done" }}
        keyboardActions={{ onDone: () => void add() }}
        textStyle={{ fontFamily }}
        onValueChange={setName}
        isError={!!shownError}
        modifiers={[weight(1)]}
      >
        <OutlinedTextField.Label>
          <Text>{label}</Text>
        </OutlinedTextField.Label>
        <OutlinedTextField.TrailingIcon>
          <Row>
            {name !== "" && (
              <IconButton
                onClick={() => setName("")}
                modifiers={[semantics({ contentDescription: "Clear" })]}
                enabled={!busy}
              >
                <Icon name={Icons.close} color="inherit" />
              </IconButton>
            )}
            <IconButton
              enabled={canAdd}
              onClick={() => void add()}
              modifiers={[semantics({ contentDescription: "Save" })]}
            >
              {busy ? (
                <Loader size="sm" />
              ) : (
                <Icon
                  name={onCancel ? Icons.check : Icons.add}
                  color="inherit"
                />
              )}
            </IconButton>
          </Row>
        </OutlinedTextField.TrailingIcon>
        {/* Always mounted: a slot added after mount doesn't show. */}
        <OutlinedTextField.SupportingText>
          <Text style={{ typography: "bodySmall" }}>{shownError ?? ""}</Text>
        </OutlinedTextField.SupportingText>
      </OutlinedTextField>
      {/* As the search bar's: the ✕ empties the field, this leaves it. */}
      {onCancel && (
        <TextButton onClick={onCancel}>
          <Text style={{ typography: "labelLarge" }}>Cancel</Text>
        </TextButton>
      )}
    </Row>
  );
}
