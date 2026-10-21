import { Button, HStack, Spacer, VStack } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonBorderShape,
  buttonStyle,
  disabled,
  foregroundStyle,
  frame,
  labelStyle,
  lineLimit,
  monospacedDigit,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { Text } from "@/components/native/swift-ui/text";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";

export interface HeaderProps {
  title: string;
  /** A value read under the title, like the score being picked. */
  subtitle?: string;
  onCancel: () => void;
  onConfirm: () => void;
  /** OK waits for the edit to change something. */
  canConfirm: boolean;
}

/** A field view's title bar, iOS's own sheet pattern: Cancel, title, OK. */
export function Header({
  title,
  subtitle,
  onCancel,
  onConfirm,
  canConfirm,
}: HeaderProps) {
  return (
    <HStack spacing={8} modifiers={[padding({ horizontal: 16 })]}>
      <Button
        onPress={onCancel}
        modifiers={[
          buttonStyle("glass"),
          buttonBorderShape("circle"),
          labelStyle("iconOnly"),
          foregroundStyle("secondary"),
          accessibilityLabel("Cancel"),
        ]}
      >
        <Icon
          name={Icons.close}
          size={BUTTON_ICON_SIZE}
          color="inherit"
          modifiers={[frame({ width: 20, height: 20 })]}
        />
      </Button>
      <Spacer />
      <VStack spacing={2}>
        <Text textStyle="headline" modifiers={[lineLimit(1)]}>
          {title}
        </Text>
        {subtitle != null && (
          <Text
            textStyle="footnote"
            modifiers={[monospacedDigit(), foregroundStyle("secondary")]}
          >
            {subtitle}
          </Text>
        )}
      </VStack>
      <Spacer />
      <Button
        onPress={onConfirm}
        modifiers={[
          buttonStyle("glassProminent"),
          buttonBorderShape("circle"),
          labelStyle("iconOnly"),
          disabled(!canConfirm),
          accessibilityLabel("OK"),
        ]}
      >
        <Icon
          name={Icons.check}
          size={BUTTON_ICON_SIZE}
          color="inherit"
          modifiers={[frame({ width: 20, height: 20 })]}
        />
      </Button>
    </HStack>
  );
}
