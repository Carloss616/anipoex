import { useValue } from "@legendapp/state/react";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { View } from "react-native";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { readingRun$ } from "@/features/manga/state/reading-queue";
import { retrySkipped } from "../../utils/actions";
import { skippedMenu } from "../../utils/row-menu";

export interface SkippedItemProps {
  sourceId: string;
  /**
   * Its place in the section, for its corners.
   * @platform android
   */
  index?: number;
  /** @platform android */
  count?: number;
}

/** A source skipped as slow, and how many manga it was left out of. */
export const SkippedItem = memo(function SkippedItem({
  sourceId,
}: SkippedItemProps) {
  const skipped$ = readingRun$.skipped[sourceId];
  const name = useValue(skipped$.name);
  const count = useValue(() => skipped$.mangaIds.get()?.length ?? 0);

  return (
    <View>
      <ContextMenu items={skippedMenu(sourceId)}>
        <Frame.Row className="pe-17">
          <Frame.Content>
            <Frame.Title as="p">{name}</Frame.Title>
            <Frame.Description>{`In ${count} manga`}</Frame.Description>
          </Frame.Content>
        </Frame.Row>
      </ContextMenu>
      <Frame.Actions className="absolute inset-y-0 inset-e-4">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => retrySkipped(sourceId)}
          aria-label={`Retry ${name}`}
        >
          <Icon name={Icons.refresh} />
        </Button>
      </Frame.Actions>
    </View>
  );
});
