import {
  Button,
  ContextMenu,
  HStack,
  Spacer,
  SwipeActions,
  VStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityHidden,
  accessibilityLabel,
  buttonStyle,
  foregroundStyle,
  lineLimit,
  opacity,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useRouter } from "expo-router";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { useThemeColor } from "@/hooks/use-theme-color";
import { noop } from "@/utils/utils";
import type { ChapterItemProps } from "./chapter-item";
import { useChapterRead } from "./hooks/use-chapter-read";
import { useIsNext } from "./hooks/use-is-next";

/** Tap opens the reader; download is behind a swipe and the long-press menu. */
export function ChapterItem({
  chapter,
  mediaId,
  entryId,
  continue$,
}: ChapterItemProps) {
  const router = useRouter();
  const read = useChapterRead(entryId, chapter.number);
  const next = useIsNext(continue$, chapter.id);
  const primary = useThemeColor("primary");
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
                pathname: "/manga/[id]/reader",
                params: {
                  id: mediaId,
                  chapter: chapter.id,
                },
              })
            }
            modifiers={[buttonStyle("plain")]}
          >
            {/* A plain button only takes touches on its label, so the
                label fills the row. */}
            <HStack
              spacing={8}
              modifiers={[
                padding({ vertical: 16, horizontal: 16 }),
                ...ROW_FILL,
                ...(read ? [opacity(0.64)] : []),
              ]}
            >
              <VStack alignment="leading" spacing={2}>
                <HStack spacing={6}>
                  {read && (
                    <HStack spacing={-7}>
                      <Icon
                        name={Icons.read}
                        size={12}
                        color={primary}
                        modifiers={[accessibilityLabel("Read")]}
                      />
                      <Icon
                        name={Icons.read}
                        size={12}
                        color={primary}
                        modifiers={[accessibilityHidden()]}
                      />
                    </HStack>
                  )}
                  {next && <Badge color="primary" />}
                  <Text weight="medium" modifiers={[lineLimit(1)]}>
                    {chapter.title}
                  </Text>
                </HStack>
                <Text
                  textStyle="subheadline"
                  modifiers={[foregroundStyle("secondary")]}
                >
                  {chapter.date}
                </Text>
              </VStack>
              <Spacer />
              {next && <Badge color="primary">Next</Badge>}
            </HStack>
          </Button>
        </ContextMenu.Trigger>
      </ContextMenu>
      <SwipeActions.Actions>{download}</SwipeActions.Actions>
    </SwipeActions>
  );
}
