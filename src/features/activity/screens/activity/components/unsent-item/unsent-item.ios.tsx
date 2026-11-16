import { Button, HStack, SwipeActions, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle, lineLimit, tint } from "@expo/ui/swift-ui/modifiers";
import { memo, useState } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Dialog } from "@/components/ui/dialog";
import { Icons, sfSymbol } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { useThemeColor } from "@/hooks/use-theme-color";
import { discardUnsent, retryUnsent } from "../../utils/actions";
import { DISCARD_DIALOG, unsentMenu } from "../../utils/row-menu";
import { useUnsentItem } from "./hooks/use-unsent-item";
import type { UnsentItemProps } from "./unsent-item";

export const UnsentItem = memo(function UnsentItem({ id }: UnsentItemProps) {
  const { title, error } = useUnsentItem(id);
  const [primary, destructive] = useThemeColor(["primary", "destructive"]);
  // Discard confirms in the row's alert, which the swipe opens too.
  const [discarding, setDiscarding] = useState(false);
  const discard = () => setDiscarding(true);

  return (
    <SwipeActions>
      <ContextMenu items={unsentMenu(id, discard)}>
        <HStack modifiers={ROW_FILL}>
          <VStack alignment="leading" spacing={2}>
            <Text modifiers={[lineLimit(1)]}>{title}</Text>
            <Text
              textStyle="subheadline"
              modifiers={[foregroundStyle(destructive), lineLimit(2)]}
            >
              {error}
            </Text>
          </VStack>
          <Dialog
            {...DISCARD_DIALOG}
            alert
            role="destructive"
            open={discarding}
            onOpenChange={setDiscarding}
            onConfirm={() => discardUnsent(id)}
          />
        </HStack>
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
        <Button
          label="Retry"
          systemImage={sfSymbol(Icons.refresh)}
          modifiers={[tint(primary)]}
          onPress={() => retryUnsent(id)}
        />
      </SwipeActions.Actions>
    </SwipeActions>
  );
});
