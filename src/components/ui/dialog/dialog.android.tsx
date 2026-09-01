import { AlertDialog } from "@expo/ui/jetpack-compose";
import { useState } from "react";
import { Button } from "../button";
import { EnsureHost } from "../host";
import { Typography } from "../typography";
import type { DialogProps } from "./dialog";
import { extractTrigger, Trigger } from "./trigger";

/** @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/alertdialog/ */
function DialogRoot({
  children,
  title,
  description,
  confirmLabel,
  onConfirm,
  cancelLabel = "Cancel",
  destructive = false,
  open,
  onOpenChange,
}: DialogProps) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const isOpen = open ?? uncontrolled;
  const setOpen = onOpenChange ?? setUncontrolled;

  return (
    <EnsureHost matchContents>
      {children && extractTrigger(children, () => setOpen(true))}
      {isOpen && (
        <AlertDialog onDismissRequest={() => setOpen(false)}>
          <AlertDialog.Title>
            <Typography>{title}</Typography>
          </AlertDialog.Title>
          {description && (
            <AlertDialog.Text>
              <Typography type="body-sm" muted>
                {description}
              </Typography>
            </AlertDialog.Text>
          )}
          <AlertDialog.DismissButton>
            <Button variant="ghost" onPress={() => setOpen(false)}>
              {cancelLabel}
            </Button>
          </AlertDialog.DismissButton>
          <AlertDialog.ConfirmButton>
            <Button
              variant={destructive ? "destructive" : "primary"}
              onPress={() => {
                setOpen(false);
                onConfirm();
              }}
            >
              {confirmLabel}
            </Button>
          </AlertDialog.ConfirmButton>
        </AlertDialog>
      )}
    </EnsureHost>
  );
}

export const Dialog = Object.assign(DialogRoot, { Trigger });
