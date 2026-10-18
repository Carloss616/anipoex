import { Button, Row, Spacer, TextButton } from "@expo/ui/jetpack-compose";
import { padding, weight } from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { FooterProps } from "./footer";

const LABEL = { typography: "labelLarge" } as const;

export function Footer({
  onCancel,
  onConfirm,
  canConfirm,
  onRemove,
  canRemove,
}: FooterProps) {
  const m3 = useThemeM3Colors();

  return (
    <Row
      verticalAlignment="center"
      horizontalArrangement={{ spacedBy: 16 }}
      modifiers={[padding(16, 0, 16, 0)]}
    >
      {onRemove && (
        <TextButton
          enabled={canRemove}
          onClick={onRemove}
          colors={{ contentColor: m3.error }}
        >
          <Text style={LABEL}>Remove</Text>
        </TextButton>
      )}
      <Spacer modifiers={[weight(1)]} />
      <TextButton onClick={onCancel}>
        <Text style={LABEL}>Cancel</Text>
      </TextButton>
      <Button enabled={canConfirm} onClick={onConfirm}>
        <Text style={LABEL}>OK</Text>
      </Button>
    </Row>
  );
}
