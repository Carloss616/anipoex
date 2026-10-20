import type { ButtonRole } from "@expo/ui/swift-ui";
import { Dialog as PanelDialog } from "panelui-native/components/dialog";
import type { ReactElement } from "react";
import { Button } from "../button";
import { dialogActions } from "./utils";

export interface DialogAction {
  label: string;
  onPress: () => void;
  /** iOS's roles; web and Android express `destructive` and `cancel`, the rest are normal actions. */
  role?: ButtonRole;
}

interface DialogBaseProps {
  /** A single `Dialog.Trigger` wrapping the element that opens the dialog. */
  children?: ReactElement;
  title: string;
  description?: string;
  cancelLabel?: string;
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

/** One confirm action, or several `actions`; each closes the dialog before it runs. A `cancel` one replaces the built-in Cancel. */
export type DialogProps = DialogBaseProps &
  (
    | {
        confirmLabel: string;
        onConfirm: () => void;
        role?: ButtonRole;
        actions?: never;
      }
    | {
        actions: DialogAction[];
        confirmLabel?: never;
        onConfirm?: never;
        role?: never;
      }
  );

function DialogRoot(props: DialogProps) {
  const { children, title, description, className, open, onOpenChange } = props;
  const { actions, cancel } = dialogActions(props);

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
            <Button size="sm" variant="ghost" onPress={cancel.onPress}>
              {cancel.label}
            </Button>
          </PanelDialog.Close>
          {actions.map((action) => (
            <PanelDialog.Close key={action.label}>
              <Button
                size="sm"
                variant={
                  action.role === "destructive" ? "destructive" : "primary"
                }
                onPress={action.onPress}
              >
                {action.label}
              </Button>
            </PanelDialog.Close>
          ))}
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
