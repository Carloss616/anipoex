import { Button } from "panelui-web/button";
import { Field } from "panelui-web/field";
import { Input } from "panelui-web/input";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { Icon, Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { useNewList } from "./hooks/use-new-list";

export interface NewListFieldProps {
  /** The names it can't take. */
  names: string[];
  /** Whether it went through; the error link toasts a failure. */
  onSubmit: (name: string) => Promise<boolean>;
  /** What the field asks for; "New list" by default. */
  label?: string;
  /** Read once, at mount: give the field a new `key` for another one. */
  initial?: string;
  /** Shows a Cancel button beside the field; the ✕ inside only empties it. */
  onCancel?: () => void;
}

/** Names a custom list. Its own component, so typing redraws only it. */
export function NewListField({
  names,
  onSubmit,
  label = "New list",
  initial,
  onCancel,
}: NewListFieldProps) {
  const { name, setName, busy, shownError, canAdd, add } = useNewList(
    names,
    onSubmit,
    initial,
  );
  const input = useRef<HTMLInputElement>(null);
  const editing = !!onCancel;

  // Next tick: the menu that opened it hands focus back to its trigger first.
  useEffect(() => {
    if (!editing) return;
    const timer = setTimeout(() => input.current?.select());
    return () => clearTimeout(timer);
  }, [editing]);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void add();
      }}
    >
      <Field invalid={!!shownError}>
        <View className="flex-row items-center gap-2">
          <Input.Group aria-label={label} className="flex-1 rounded-full">
            <Input
              ref={input}
              placeholder={label}
              aria-label={label}
              disabled={busy}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input.Addon align="end">
              {name !== "" && (
                <Button
                  type="button"
                  size="icon-sm"
                  shape="pill"
                  variant="ghost"
                  aria-label="Clear"
                  disabled={busy}
                  onClick={() => {
                    setName("");
                    input.current?.focus();
                  }}
                >
                  <Icon name={Icons.closeCircle} />
                </Button>
              )}
              <Button
                type="submit"
                size="icon-sm"
                shape="pill"
                variant="ghost"
                disabled={!canAdd}
                aria-label="Save"
              >
                {busy ? (
                  <Loader size="sm" />
                ) : (
                  <Icon name={onCancel ? Icons.check : Icons.add} />
                )}
              </Button>
            </Input.Addon>
          </Input.Group>
          {/* As the search bar's: the ✕ empties the field, this leaves it. */}
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </View>
        <Field.Error match={!!shownError}>{shownError}</Field.Error>
      </Field>
    </form>
  );
}
