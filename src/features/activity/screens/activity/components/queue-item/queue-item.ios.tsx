import { Button, HStack, SwipeActions, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  clipShape,
  foregroundStyle,
  frame,
  lineLimit,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { Memo, useValue } from "@legendapp/state/react";
import { router } from "expo-router";
import { memo } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { Icons, sfSymbol } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { readingQueue$ } from "@/features/manga/state/reading-queue";
import { useThemeColor } from "@/hooks/use-theme-color";
import { removeFromQueue, scanNext } from "../../utils/actions";
import { queuedMenu } from "../../utils/row-menu";
import { queuedIds, split } from "../../utils/state";
import type { QueueItemProps } from "./queue-item";

export const QueueItem = memo(function QueueItem({ id }: QueueItemProps) {
  const item$ = readingQueue$[id];
  const name = useValue(item$.name) ?? "";
  const cover = useValue(item$.cover);
  const retry = useValue(() => item$.only.get()?.length ?? 0);
  const [primary, destructive] = useThemeColor(["primary", "destructive"]);
  const open = () => router.navigate(`/manga/${item$.mangaId.peek()}`);

  return (
    <SwipeActions>
      <ContextMenu items={queuedMenu(id, open)}>
        <Button onPress={open} modifiers={[buttonStyle("plain")]}>
          <HStack spacing={12} modifiers={ROW_FILL}>
            <Memo>
              {() => (
                <Text
                  textStyle="subheadline"
                  modifiers={[
                    foregroundStyle("secondary"),
                    frame({ width: 22, alignment: "trailing" }),
                  ]}
                >
                  {String(split(queuedIds()).indexOf(id) + 1)}
                </Text>
              )}
            </Memo>
            {cover ? (
              <Image
                source={{ uri: cover }}
                modifiers={[
                  frame({ width: 28, height: 40 }),
                  clipShape("roundedRectangle", 5),
                ]}
              />
            ) : null}
            <VStack alignment="leading" spacing={2}>
              <Text modifiers={[lineLimit(1)]}>{name}</Text>
              {retry > 0 ? (
                <Text
                  textStyle="subheadline"
                  modifiers={[foregroundStyle("secondary")]}
                >
                  {`Retry of ${retry} source${retry > 1 ? "s" : ""}`}
                </Text>
              ) : null}
            </VStack>
          </HStack>
        </Button>
      </ContextMenu>
      {/* Both on the trailing edge: on a pushed screen iOS 26's back swipe
          takes a rightward drag, so a leading edge never opens. */}
      <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
        <Button
          label="Remove"
          systemImage={sfSymbol(Icons.close)}
          modifiers={[tint(destructive)]}
          onPress={() => removeFromQueue(id)}
        />
        <Button
          label="Scan next"
          systemImage={sfSymbol(Icons.moveToTop)}
          modifiers={[tint(primary)]}
          onPress={() => scanNext(id)}
        />
      </SwipeActions.Actions>
    </SwipeActions>
  );
});
