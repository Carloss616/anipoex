import { Button, HStack } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonBorderShape,
  buttonStyle,
  controlSize,
  foregroundStyle,
  labelStyle,
} from "@expo/ui/swift-ui/modifiers";
import { Text } from "@/components/native/swift-ui/text";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { useSourcePicker } from "../../hooks/use-source-picker";
import type { SourcePickerProps } from "./source-picker";

export function SourcePicker({ manga, entryId, open$ }: SourcePickerProps) {
  const picker = useSourcePicker(manga, entryId, open$);

  return (
    <>
      <Button
        onPress={picker.open}
        modifiers={[buttonStyle("borderless"), controlSize("small")]}
      >
        <HStack spacing={4}>
          <Text
            textStyle="subheadline"
            modifiers={[foregroundStyle("secondary")]}
          >
            {picker.label}
          </Text>
          <Icon name={Icons.chevronDown} size={16} color="inherit" />
        </HStack>
      </Button>
      {picker.hasWeb && (
        <Button
          onPress={picker.openWeb}
          modifiers={[
            buttonStyle("borderless"),
            buttonBorderShape("circle"),
            labelStyle("iconOnly"),
            foregroundStyle("secondary"),
            accessibilityLabel(`Open on ${picker.label}`),
          ]}
        >
          <Icon name={Icons.website} size={BUTTON_ICON_SIZE} color="inherit" />
        </Button>
      )}
    </>
  );
}
