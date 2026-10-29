import { Button } from "panelui-web/button";
import { Sheet } from "panelui-web/sheet";

export interface FooterProps {
  onCancel: () => void;
  onConfirm: () => void;
  /** OK waits for the edit to change something. */
  canConfirm: boolean;
  /** Clears the field; the button only shows when this is given. */
  onRemove?: () => void;
  canRemove?: boolean;
}

/**
 * A field view's actions: an optional Remove leading, Cancel and OK trailing.
 * On web each one closes the field's Sheet.Next as it runs.
 */
export function Footer({
  onCancel,
  onConfirm,
  canConfirm,
  onRemove,
  canRemove,
}: FooterProps) {
  return (
    // A row, not Sheet.Footer's stack: Remove leads, Cancel and OK trail.
    <Sheet.Footer className="flex-row items-center gap-4">
      {onRemove && (
        <Sheet.Close
          render={<Button variant="destructive" />}
          disabled={!canRemove}
          onClick={onRemove}
        >
          Remove
        </Sheet.Close>
      )}
      <Sheet.Close
        render={<Button variant="ghost" />}
        className="ms-auto"
        onClick={onCancel}
      >
        Cancel
      </Sheet.Close>
      <Sheet.Close
        render={<Button />}
        disabled={!canConfirm}
        onClick={onConfirm}
      >
        OK
      </Sheet.Close>
    </Sheet.Footer>
  );
}
