import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { memo, useState } from "react";
import { View } from "react-native";
import { Dialog } from "@/components/ui/dialog";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import {
  discardPending,
  retryUnsent,
} from "@/features/activity/screens/activity/utils/actions";
import {
  DISCARD_DIALOG,
  unsentMenu,
} from "@/features/activity/screens/activity/utils/row-menu";
import { useUnsentItem } from "./hooks/use-unsent-item";

export interface UnsentItemProps {
  /** The AniList media id the progress is kept under. */
  id: string;
  /**
   * Its place in the section, for its corners.
   * @platform android
   */
  index?: number;
  /** @platform android */
  count?: number;
}

/** Progress kept offline that AniList turned down, and why. */
export const UnsentItem = memo(function UnsentItem({ id }: UnsentItemProps) {
  const { title, error } = useUnsentItem(id);
  const [discarding, setDiscarding] = useState(false);

  return (
    <View>
      <ContextMenu items={unsentMenu(id)}>
        <Frame.Row className="pe-27">
          <Frame.Content>
            <Frame.Title as="p">{title}</Frame.Title>
            <Frame.Description className="text-destructive">
              {error}
            </Frame.Description>
          </Frame.Content>
        </Frame.Row>
      </ContextMenu>
      <Frame.Actions className="absolute inset-y-0 inset-e-4">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => retryUnsent(id)}
          aria-label={`Retry ${title}`}
        >
          <Icon name={Icons.refresh} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setDiscarding(true)}
          aria-label={`Discard ${title}`}
        >
          <Icon name={Icons.trash} />
        </Button>
      </Frame.Actions>
      <Dialog
        {...DISCARD_DIALOG}
        role="destructive"
        open={discarding}
        onOpenChange={setDiscarding}
        onConfirm={() => discardPending(Number(id))}
      />
    </View>
  );
});
