import { Button, HStack, SwipeActions, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle, tint } from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Icons, sfSymbol } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { readingRun$ } from "@/features/manga/state/reading-queue";
import { useThemeColor } from "@/hooks/use-theme-color";
import { retrySkipped } from "../../utils/actions";
import { skippedMenu } from "../../utils/row-menu";
import type { SkippedItemProps } from "./skipped-item";

export const SkippedItem = memo(function SkippedItem({
  sourceId,
}: SkippedItemProps) {
  const skipped$ = readingRun$.skipped[sourceId];
  const name = useValue(skipped$.name) ?? "";
  const count = useValue(() => skipped$.mangaIds.get()?.length ?? 0);
  const primary = useThemeColor("primary");

  return (
    <SwipeActions>
      <ContextMenu items={skippedMenu(sourceId)}>
        <HStack modifiers={ROW_FILL}>
          <VStack alignment="leading" spacing={2}>
            <Text>{name}</Text>
            <Text
              textStyle="subheadline"
              modifiers={[foregroundStyle("secondary")]}
            >
              {`In ${count} manga`}
            </Text>
          </VStack>
        </HStack>
      </ContextMenu>
      <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
        <Button
          label="Retry"
          systemImage={sfSymbol(Icons.refresh)}
          modifiers={[tint(primary)]}
          onPress={() => retrySkipped(sourceId)}
        />
      </SwipeActions.Actions>
    </SwipeActions>
  );
});
