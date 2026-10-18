import { Spacer } from "@expo/ui";
import { Row } from "@/components/layout/row";
import { Button } from "@/components/ui/button";

export interface FooterProps {
  onCancel: () => void;
  onConfirm: () => void;
  /** OK waits for the edit to change something. */
  canConfirm: boolean;
  /** Clears the field; the button only shows when this is given. */
  onRemove?: () => void;
  canRemove?: boolean;
}

/** A field view's actions: an optional Remove leading, Cancel and OK trailing. */
export function Footer({
  onCancel,
  onConfirm,
  canConfirm,
  onRemove,
  canRemove,
}: FooterProps) {
  return (
    <Row alignment="center" className="gap-4 px-4">
      {onRemove && (
        <Button variant="destructive" disabled={!canRemove} onPress={onRemove}>
          Remove
        </Button>
      )}
      <Spacer flexible />
      <Button variant="ghost" onPress={onCancel}>
        Cancel
      </Button>
      <Button disabled={!canConfirm} onPress={onConfirm}>
        OK
      </Button>
    </Row>
  );
}
