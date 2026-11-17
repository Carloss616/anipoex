import { Button, HStack, SwipeActions, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  clipShape,
  foregroundStyle,
  frame,
  lineLimit,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import { memo, useState } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { Dialog } from "@/components/ui/dialog";
import { Icons, sfSymbol } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { discardPending } from "@/features/activity/screens/activity/utils/actions";
import {
  DISCARD_DIALOG,
  discardItem,
} from "@/features/activity/screens/activity/utils/row-menu";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { EntryItemProps } from "./entry-item";
import { useEntryItem } from "./hooks/use-entry-item";

export const EntryItem = memo(function EntryItem({ id }: EntryItemProps) {
  const { title, cover, summary } = useEntryItem(id);
  const destructive = useThemeColor("destructive");
  // Discard confirms in the row's alert, which the swipe opens too.
  const [discarding, setDiscarding] = useState(false);
  const discard = () => setDiscarding(true);

  return (
    <SwipeActions>
      <ContextMenu items={[discardItem(id, discard)]}>
        <Button
          onPress={() => router.navigate(`/manga/${id}`)}
          modifiers={[buttonStyle("plain")]}
        >
          <HStack spacing={12} modifiers={ROW_FILL}>
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
              <Text modifiers={[lineLimit(1)]}>{title}</Text>
              <Text
                textStyle="subheadline"
                modifiers={[foregroundStyle("secondary"), lineLimit(2)]}
              >
                {summary}
              </Text>
            </VStack>
            <Dialog
              {...DISCARD_DIALOG}
              alert
              role="destructive"
              open={discarding}
              onOpenChange={setDiscarding}
              onConfirm={() => discardPending(Number(id))}
            />
          </HStack>
        </Button>
      </ContextMenu>
      <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
        {/* No destructive role: SwiftUI would drop the row before the alert
            confirms. */}
        <Button
          label="Discard"
          systemImage={sfSymbol(Icons.trash)}
          modifiers={[tint(destructive)]}
          onPress={discard}
        />
      </SwipeActions.Actions>
    </SwipeActions>
  );
});
