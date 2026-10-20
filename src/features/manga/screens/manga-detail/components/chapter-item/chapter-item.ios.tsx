import { Button, HStack, VStack } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonBorderShape,
  buttonStyle,
  contentShape,
  foregroundStyle,
  frame,
  labelStyle,
  opacity,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { useRouter } from "expo-router";
import { Text } from "@/components/native/swift-ui/text";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import { isRead } from "@/features/manga/utils/to-chapters";
import { noop } from "@/utils/utils";
import type { ChapterItemProps } from "./chapter-item";

export function ChapterItem({ chapter, mediaId, entryId }: ChapterItemProps) {
  const router = useRouter();
  // Per row, not per screen: a progress change re-renders the rows only.
  const read = isRead(useTrackingEntry(entryId)?.progress ?? 0, chapter.number);

  return (
    <HStack
      spacing={12}
      modifiers={[padding({ trailing: 16 }), ...(read ? [opacity(0.64)] : [])]}
    >
      <Button
        onPress={() =>
          router.push({
            pathname: "/reader",
            params: { mediaId, chapter: chapter.id },
          })
        }
        modifiers={[buttonStyle("plain")]}
      >
        {/* A plain button only takes touches on its label, so the label fills the row. */}
        <VStack
          alignment="leading"
          spacing={2}
          modifiers={[
            padding({ vertical: 16, leading: 16 }),
            frame({ maxWidth: Infinity, alignment: "leading" }),
            contentShape(shapes.rectangle()),
          ]}
        >
          <Text weight="medium">{chapter.title}</Text>
          <Text
            textStyle="subheadline"
            modifiers={[foregroundStyle("secondary")]}
          >
            {chapter.date}
          </Text>
        </VStack>
      </Button>
      <Button
        onPress={noop}
        modifiers={[
          buttonStyle("glass"),
          buttonBorderShape("circle"),
          labelStyle("iconOnly"),
          accessibilityLabel(`Download chapter ${chapter.title}`),
        ]}
      >
        <Icon name={Icons.download} size={BUTTON_ICON_SIZE} color="inherit" />
      </Button>
    </HStack>
  );
}
