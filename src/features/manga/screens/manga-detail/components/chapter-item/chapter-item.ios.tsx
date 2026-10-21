import { Button, ContextMenu, SwipeActions, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  foregroundStyle,
  lineLimit,
  opacity,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useRouter } from "expo-router";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { noop } from "@/utils/utils";
import type { ChapterItemProps } from "./chapter-item";
import { useChapterRead } from "./hooks/use-chapter-read";

/** Tap opens the reader; download sits behind a swipe and the long-press menu. */
export function ChapterItem({ chapter, mediaId, entryId }: ChapterItemProps) {
  const router = useRouter();
  const read = useChapterRead(entryId, chapter.number);
  const download = (
    <Button label="Download" systemImage="arrow.down.circle" onPress={noop} />
  );

  return (
    <SwipeActions>
      <ContextMenu>
        <ContextMenu.Items>{download}</ContextMenu.Items>
        <ContextMenu.Trigger>
          <Button
            onPress={() =>
              router.push({
                pathname: "/reader",
                params: {
                  mediaId,
                  chapter: chapter.id,
                  title: chapter.title,
                  memo: chapter.memo ?? undefined,
                },
              })
            }
            modifiers={[buttonStyle("plain")]}
          >
            {/* A plain button only takes touches on its label, so the label fills the row. */}
            <VStack
              alignment="leading"
              spacing={2}
              modifiers={[
                padding({ vertical: 16, horizontal: 16 }),
                ...ROW_FILL,
                ...(read ? [opacity(0.64)] : []),
              ]}
            >
              <Text weight="medium" modifiers={[lineLimit(1)]}>
                {chapter.title}
              </Text>
              <Text
                textStyle="subheadline"
                modifiers={[foregroundStyle("secondary")]}
              >
                {chapter.date}
              </Text>
            </VStack>
          </Button>
        </ContextMenu.Trigger>
      </ContextMenu>
      <SwipeActions.Actions>{download}</SwipeActions.Actions>
    </SwipeActions>
  );
}
