import { Button, HStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  controlSize,
  foregroundStyle,
} from "@expo/ui/swift-ui/modifiers";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { SourceSheet } from "../source-sheet";
import { useSourcePicker } from "./hooks/use-source-picker";
import type { SourcePickerProps } from "./source-picker";

export function SourcePicker({ manga }: SourcePickerProps) {
  const picker = useSourcePicker(manga);

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

      <SourceSheet
        isPresented={picker.isPresented}
        selectedId={picker.sourceId}
        onSelect={picker.select}
        onDismiss={picker.close}
      />
    </>
  );
}
