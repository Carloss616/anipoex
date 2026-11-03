import type { ButtonRole } from "@expo/ui/swift-ui";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { Dialog as PanelDialog } from "panelui-web/dialog";
import { type ReactElement, useState } from "react";
import { extractTrigger, Trigger } from "./trigger";
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
  const [innerOpen, setInnerOpen] = useState(false);
  const setOpen = (next: boolean) => {
    if (open === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  return (
    <>
      {children && extractTrigger(children, () => setOpen(true))}
      <PanelDialog open={open ?? innerOpen} onOpenChange={setOpen}>
        <PanelDialog.Content blur className={cn("glass-sheet!", className)}>
          <PanelDialog.Header title={title} description={description} />
          <PanelDialog.Footer>
            <PanelDialog.Close
              render={<Button variant="outline" />}
              onClick={cancel.onPress}
            >
              {cancel.label}
            </PanelDialog.Close>
            {actions.map((action) => (
              <PanelDialog.Close
                key={action.label}
                render={
                  <Button
                    variant={
                      action.role === "destructive" ? "destructive" : "default"
                    }
                  />
                }
                onClick={action.onPress}
              >
                {action.label}
              </PanelDialog.Close>
            ))}
          </PanelDialog.Footer>
        </PanelDialog.Content>
      </PanelDialog>
    </>
  );
}

/**
 * An uncontrolled confirm/cancel dialog, natively rendered per platform.
 * @see https://panelui.dev/docs/web/components/dialog
 */
export const Dialog = Object.assign(DialogRoot, { Trigger });
