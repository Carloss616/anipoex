import { AlertDialog, TextButton } from "@expo/ui/jetpack-compose";
import { useState } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { EnsureHost } from "../host";
import { extractTrigger, Trigger } from "./components/trigger";
import type { DialogAction, DialogProps } from "./dialog";
import { dialogActions } from "./utils";

const LABEL = { typography: "labelLarge" } as const;

/**
 * M3's dialog: every action is a text button, in the error color when it
 * destroys something.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/alertdialog/
 */
function DialogRoot(props: DialogProps) {
  const { children, title, description, open, onOpenChange } = props;
  const [uncontrolled, setUncontrolled] = useState(false);
  const isOpen = open ?? uncontrolled;
  const setOpen = onOpenChange ?? setUncontrolled;
  const m3 = useThemeM3Colors();
  const { actions, cancel } = dialogActions(props);
  const run = (action: DialogAction) => () => {
    setOpen(false);
    action.onPress();
  };

  return (
    <EnsureHost matchContents>
      {children && extractTrigger(children, () => setOpen(true))}
      {isOpen && (
        <AlertDialog onDismissRequest={() => setOpen(false)}>
          <AlertDialog.Title>
            <Text style={{ typography: "headlineSmall" }}>{title}</Text>
          </AlertDialog.Title>
          {description && (
            <AlertDialog.Text>
              <Text
                style={{ typography: "bodyMedium" }}
                color={m3.onSurfaceVariant}
              >
                {description}
              </Text>
            </AlertDialog.Text>
          )}
          <AlertDialog.DismissButton>
            <TextButton onClick={run(cancel)}>
              <Text style={LABEL}>{cancel.label}</Text>
            </TextButton>
          </AlertDialog.DismissButton>
          {/* M3 flows every button in the slot onto the action row. */}
          <AlertDialog.ConfirmButton>
            {actions.map((action) => (
              <TextButton
                key={action.label}
                onClick={run(action)}
                colors={
                  action.role === "destructive"
                    ? { contentColor: m3.error }
                    : undefined
                }
              >
                <Text style={LABEL}>{action.label}</Text>
              </TextButton>
            ))}
          </AlertDialog.ConfirmButton>
        </AlertDialog>
      )}
    </EnsureHost>
  );
}

export const Dialog = Object.assign(DialogRoot, { Trigger });
