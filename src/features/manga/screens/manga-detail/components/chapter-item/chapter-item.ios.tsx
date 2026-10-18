import { Button, HStack, Spacer, VStack } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonBorderShape,
  buttonStyle,
  foregroundStyle,
  labelStyle,
  opacity,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import { noop } from "@/utils/utils";
import type { ChapterItemProps } from "./chapter-item";

export function ChapterItem({ chapter, entryId }: ChapterItemProps) {
  // Per row, not per screen: a progress change re-renders the rows only.
  const read = (useTrackingEntry(entryId)?.progress ?? 0) > chapter.id;

  return (
    <HStack
      spacing={12}
      modifiers={[padding({ all: 16 }), ...(read ? [opacity(0.64)] : [])]}
    >
      <VStack alignment="leading" spacing={2}>
        <Text weight="medium">{chapter.title}</Text>
        <Text
          textStyle="subheadline"
          modifiers={[foregroundStyle("secondary")]}
        >
          {chapter.date}
        </Text>
      </VStack>
      <Spacer />
      <Button
        onPress={noop}
        modifiers={[
          buttonStyle("glass"),
          buttonBorderShape("circle"),
          labelStyle("iconOnly"),
          accessibilityLabel(`Download chapter ${chapter.title}`),
        ]}
      >
        <Icon name={Icons.download} size={18} color="inherit" />
      </Button>
    </HStack>
  );
}
