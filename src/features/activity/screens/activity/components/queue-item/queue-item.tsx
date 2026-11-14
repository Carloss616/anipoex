import { Memo, useValue } from "@legendapp/state/react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { View } from "react-native";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { readingQueue$ } from "@/features/manga/state/reading-queue";
import { removeFromQueue, scanNext } from "../../utils/actions";
import { queuedMenu } from "../../utils/row-menu";
import { queuedIds, split } from "../../utils/state";

export interface QueueItemProps {
  id: string;
  /**
   * Its place in the section, for its corners.
   * @platform android
   */
  index?: number;
  /** @platform android */
  count?: number;
}

/** A manga waiting its turn in the Reading scan, with its place. */
export const QueueItem = memo(function QueueItem({ id }: QueueItemProps) {
  const item$ = readingQueue$[id];
  const name = useValue(item$.name);
  const cover = useValue(item$.cover);
  const retry = useValue(() => item$.only.get()?.length ?? 0);
  const open = () => router.navigate(`/manga/${item$.mangaId.peek()}`);

  return (
    <View>
      <ContextMenu items={queuedMenu(id, open)}>
        <Frame.Row onClick={open} className="pe-27">
          <Typography type="body-xs" muted className="w-5 text-end">
            <Memo>{() => split(queuedIds()).indexOf(id) + 1}</Memo>
          </Typography>
          <Frame.Media>
            <Image
              source={cover}
              contentFit="cover"
              style={{ width: 28, height: 40, borderRadius: 6 }}
            />
          </Frame.Media>
          <Frame.Content>
            <Frame.Title as="p">{name}</Frame.Title>
            {retry > 0 && (
              <Frame.Description>
                {`Retry of ${retry} source${retry > 1 ? "s" : ""}`}
              </Frame.Description>
            )}
          </Frame.Content>
        </Frame.Row>
      </ContextMenu>
      <Frame.Actions className="absolute inset-y-0 inset-e-4">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => scanNext(id)}
          aria-label={`Scan ${name} next`}
        >
          <Icon name={Icons.moveToTop} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => removeFromQueue(id)}
          aria-label={`Remove ${name} from the queue`}
        >
          <Icon name={Icons.close} />
        </Button>
      </Frame.Actions>
    </View>
  );
});
