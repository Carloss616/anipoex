import { Computed } from "@legendapp/state/react";
import { Image } from "expo-image";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { View } from "react-native";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { Progress } from "@/components/ui/progress";
import { downloadProgress$ } from "@/features/downloads";
import {
  cancelDownload,
  moveDownloadUp,
  retryDownload,
} from "../../utils/actions";
import { downloadRowMenu } from "../../utils/row-menu";
import { useDownloadItem } from "./hooks/use-download-item";

export interface DownloadItemProps {
  /** The download's key in the queue. */
  id: string;
  /**
   * Its place in the section, for its corners.
   * @platform android
   */
  index?: number;
  /** @platform android */
  count?: number;
}

/** A chapter in the download queue: its progress, or why it failed. */
export const DownloadItem = memo(function DownloadItem({
  id,
}: DownloadItemProps) {
  const { title, cover, source, state, line, canMoveUp } = useDownloadItem(id);
  const moves = state === "queued" && canMoveUp;

  return (
    <View>
      <ContextMenu items={downloadRowMenu(id, { state, canMoveUp })}>
        <Frame.Row className={moves || state === "failed" ? "pe-27" : "pe-17"}>
          <Frame.Media>
            <Image
              source={cover}
              contentFit="cover"
              className="aspect-2/3 w-7 rounded-sm"
            />
          </Frame.Media>
          <Frame.Content>
            <Frame.Title as="p">{title}</Frame.Title>
            {state === "running" ? (
              <Computed>
                {() => {
                  const value = downloadProgress$[id].get() ?? 0;
                  return (
                    <Progress
                      label={`${source} · ${Math.round(value * 100)}%`}
                      value={value}
                      maxValue={1}
                      size="sm"
                    />
                  );
                }}
              </Computed>
            ) : (
              <Frame.Description
                className={state === "failed" ? "text-destructive" : undefined}
              >
                {line}
              </Frame.Description>
            )}
          </Frame.Content>
        </Frame.Row>
      </ContextMenu>
      <Frame.Actions className="absolute inset-y-0 inset-e-4">
        {moves && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => moveDownloadUp(id)}
            aria-label={`Move ${title} up`}
          >
            <Icon name={Icons.moveUp} />
          </Button>
        )}
        {state === "failed" && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => retryDownload(id)}
            aria-label={`Retry ${title}`}
          >
            <Icon name={Icons.refresh} />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => cancelDownload(id)}
          aria-label={`Cancel ${title}`}
        >
          <Icon name={Icons.close} />
        </Button>
      </Frame.Actions>
    </View>
  );
});
