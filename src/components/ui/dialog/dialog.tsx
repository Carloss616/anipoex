import { Dialog as PanelDialog } from "panelui-native/components/dialog";
import type { ReactElement } from "react";
import { Button } from "../button";

export interface DialogProps {
  /** A single `Dialog.Trigger` wrapping the element that opens the dialog. */
  children?: ReactElement;
  title: string;
  description?: string;
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel?: string;
  /** Styles the confirm action as destructive. */
  destructive?: boolean;
  className?: string;
  /** Drive the dialog yourself, for openers that can't be a `Trigger` — a menu row. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Renders a centered `Alert` instead of the action-sheet `ConfirmationDialog`.
   * @platform ios
   */
  alert?: boolean;
}

function DialogRoot({
  children,
  title,
  description,
  confirmLabel,
  onConfirm,
  cancelLabel = "Cancel",
  destructive = false,
  className,
  open,
  onOpenChange,
}: DialogProps) {
  return (
    <PanelDialog open={open} onOpenChange={onOpenChange}>
      {children}
      <PanelDialog.Content className={className}>
        <PanelDialog.Title>{title}</PanelDialog.Title>
        {description && (
          <PanelDialog.Description>{description}</PanelDialog.Description>
        )}
        <PanelDialog.Footer>
          <PanelDialog.Close>
            <Button size="sm" variant="ghost">
              {cancelLabel}
            </Button>
          </PanelDialog.Close>
          <PanelDialog.Close>
            <Button
              size="sm"
              variant={destructive ? "destructive" : "primary"}
              onPress={onConfirm}
            >
              {confirmLabel}
            </Button>
          </PanelDialog.Close>
        </PanelDialog.Footer>
      </PanelDialog.Content>
    </PanelDialog>
  );
}

/**
 * An uncontrolled confirm/cancel dialog, natively rendered per platform.
 * @see https://panelui.dev/docs/components/dialog
 */
export const Dialog = Object.assign(DialogRoot, {
  Trigger: PanelDialog.Trigger,
});
