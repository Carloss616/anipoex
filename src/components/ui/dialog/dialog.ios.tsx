import { Alert, ConfirmationDialog } from "@expo/ui/swift-ui";
import { useState } from "react";
import { Button } from "../button";
import { EnsureHost } from "../host";
import { Typography } from "../typography";
import type { DialogProps } from "./dialog";
import { extractTrigger, Trigger } from "./trigger";

/**
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/confirmationdialog/
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/alert/
 */
function DialogRoot({
  children,
  title,
  description,
  confirmLabel,
  onConfirm,
  cancelLabel = "Cancel",
  destructive = false,
  alert = false,
  open,
  onOpenChange,
}: DialogProps) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const isOpen = open ?? uncontrolled;
  const setOpen = onOpenChange ?? setUncontrolled;
  const Root = alert ? Alert : ConfirmationDialog;

  return (
    <EnsureHost matchContents>
      <Root
        title={title}
        isPresented={isOpen}
        onIsPresentedChange={setOpen}
        {...(alert ? null : { titleVisibility: "visible" as const })}
      >
        {children && (
          <Root.Trigger>
            {extractTrigger(children, () => setOpen(true))}
          </Root.Trigger>
        )}
        <Root.Actions>
          <Button
            variant={destructive ? "destructive" : "primary"}
            onPress={() => {
              setOpen(false);
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
          <Button cancelRole onPress={() => setOpen(false)}>
            {cancelLabel}
          </Button>
        </Root.Actions>
        {description && (
          <Root.Message>
            <Typography>{description}</Typography>
          </Root.Message>
        )}
      </Root>
    </EnsureHost>
  );
}

export const Dialog = Object.assign(DialogRoot, { Trigger });
