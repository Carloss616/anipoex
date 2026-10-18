import { Alert, Button, ConfirmationDialog } from "@expo/ui/swift-ui";
import { useState } from "react";
import { Text } from "@/components/native/swift-ui/text";
import { EnsureHost } from "../host";
import { extractTrigger, Trigger } from "./components/trigger";
import type { DialogProps } from "./dialog";

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
            label={confirmLabel}
            role={destructive ? "destructive" : undefined}
            onPress={() => {
              setOpen(false);
              onConfirm();
            }}
          />
          <Button
            label={cancelLabel}
            role="cancel"
            onPress={() => setOpen(false)}
          />
        </Root.Actions>
        {description && (
          <Root.Message>
            <Text>{description}</Text>
          </Root.Message>
        )}
      </Root>
    </EnsureHost>
  );
}

export const Dialog = Object.assign(DialogRoot, { Trigger });
