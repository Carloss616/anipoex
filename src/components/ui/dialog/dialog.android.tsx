import { AlertDialog, TextButton } from "@expo/ui/jetpack-compose";
import { useState } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { EnsureHost } from "../host";
import type { DialogProps } from "./dialog";
import { extractTrigger, Trigger } from "./trigger";

const LABEL = { typography: "labelLarge" } as const;

/**
 * M3's dialog: both actions are text buttons, the confirming one in the
 * error color when it destroys something.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/alertdialog/
 */
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
  const m3 = useThemeM3Colors();

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
            <TextButton onClick={() => setOpen(false)}>
              <Text style={LABEL}>{cancelLabel}</Text>
            </TextButton>
          </AlertDialog.DismissButton>
          <AlertDialog.ConfirmButton>
            <TextButton
              onClick={() => {
                setOpen(false);
                onConfirm();
              }}
              colors={destructive ? { contentColor: m3.error } : undefined}
            >
              <Text style={LABEL}>{confirmLabel}</Text>
            </TextButton>
          </AlertDialog.ConfirmButton>
        </AlertDialog>
      )}
    </EnsureHost>
  );
}

export const Dialog = Object.assign(DialogRoot, { Trigger });
