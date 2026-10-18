import { Button, HStack, Spacer } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  disabled,
  foregroundStyle,
  padding,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { useFont } from "@/components/native/swift-ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { FooterProps } from "./footer";

export function Footer({
  onCancel,
  onConfirm,
  canConfirm,
  onRemove,
  canRemove,
}: FooterProps) {
  const font = useFont("body", "medium");
  const destructive = useThemeColor("destructive");

  return (
    <HStack spacing={16} modifiers={[padding({ horizontal: 16 })]}>
      {onRemove && (
        <Button
          label="Remove"
          role="destructive"
          onPress={onRemove}
          modifiers={[font, tint(destructive), disabled(!canRemove)]}
        />
      )}
      <Spacer />
      <Button
        label="Cancel"
        role="cancel"
        onPress={onCancel}
        modifiers={[font, foregroundStyle("secondary")]}
      />
      <Button
        label="OK"
        onPress={onConfirm}
        modifiers={[buttonStyle("glassProminent"), font, disabled(!canConfirm)]}
      />
    </HStack>
  );
}
