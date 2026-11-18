import { Button, HStack, SwipeActions, VStack } from "@expo/ui/swift-ui";
import {
  clipShape,
  foregroundStyle,
  frame,
  lineLimit,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { Computed } from "@legendapp/state/react";
import { memo } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { Icons, sfSymbol } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { Progress } from "@/components/ui/progress";
import { downloadProgress$ } from "@/features/downloads";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  cancelDownload,
  moveDownloadUp,
  pauseDownload,
  resumeDownload,
  retryDownload,
} from "../../utils/actions";
import { downloadRowMenu } from "../../utils/row-menu";
import type { DownloadItemProps } from "./download-item";
import { useDownloadItem } from "./hooks/use-download-item";

export const DownloadItem = memo(function DownloadItem({
  id,
}: DownloadItemProps) {
  const { title, cover, source, state, line, canMoveUp } = useDownloadItem(id);
  const [primary, destructive] = useThemeColor(["primary", "destructive"]);

  return (
    <SwipeActions>
      <ContextMenu items={downloadRowMenu(id, { state, canMoveUp })}>
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
          <VStack alignment="leading" spacing={4}>
            <Text modifiers={[lineLimit(1)]}>{title}</Text>
            {state === "running" ? (
              <Computed>
                {() => {
                  const value = downloadProgress$[id].get() ?? 0;
                  return (
                    <VStack alignment="leading" spacing={4}>
                      <Progress value={value} maxValue={1} size="sm" />
                      <Text
                        textStyle="subheadline"
                        modifiers={[foregroundStyle("secondary")]}
                      >
                        {`${source} · ${Math.round(value * 100)}%`}
                      </Text>
                    </VStack>
                  );
                }}
              </Computed>
            ) : (
              <Text
                textStyle="subheadline"
                modifiers={[
                  foregroundStyle(
                    state === "failed" ? destructive : "secondary",
                  ),
                  lineLimit(2),
                ]}
              >
                {line}
              </Text>
            )}
          </VStack>
        </HStack>
      </ContextMenu>
      <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
        <Button
          label="Cancel"
          systemImage={sfSymbol(Icons.close)}
          modifiers={[tint(destructive)]}
          onPress={() => cancelDownload(id)}
        />
        {state === "running" || state === "paused" ? (
          <Button
            label={state === "running" ? "Pause" : "Resume"}
            systemImage={sfSymbol(
              state === "running" ? Icons.pause : Icons.play,
            )}
            modifiers={[tint(primary)]}
            onPress={() =>
              state === "running" ? pauseDownload(id) : resumeDownload(id)
            }
          />
        ) : null}
        {state === "failed" ? (
          <Button
            label="Retry"
            systemImage={sfSymbol(Icons.refresh)}
            modifiers={[tint(primary)]}
            onPress={() => retryDownload(id)}
          />
        ) : null}
        {state === "queued" && canMoveUp ? (
          <Button
            label="Move up"
            systemImage={sfSymbol(Icons.moveUp)}
            modifiers={[tint(primary)]}
            onPress={() => moveDownloadUp(id)}
          />
        ) : null}
      </SwipeActions.Actions>
    </SwipeActions>
  );
});
