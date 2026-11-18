import { Box, Column, IconButton } from "@expo/ui/jetpack-compose";
import {
  clip,
  padding,
  Shapes,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { Computed } from "@legendapp/state/react";
import { memo } from "react";
import { GUTTER } from "@/components/native/constants";
import { Image } from "@/components/native/jetpack-compose/image";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { Progress } from "@/components/ui/progress";
import { downloadProgress$ } from "@/features/downloads";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import {
  cancelDownload,
  pauseDownload,
  resumeDownload,
  retryDownload,
} from "../../utils/actions";
import { downloadRowMenu } from "../../utils/row-menu";
import type { DownloadItemProps } from "./download-item";
import { useDownloadItem } from "./hooks/use-download-item";

export const DownloadItem = memo(function DownloadItem({
  id,
  index = 0,
  count = 1,
}: DownloadItemProps) {
  const { title, cover, source, state, line, canMoveUp } = useDownloadItem(id);
  const m3 = useThemeM3Colors();
  const failed = state === "failed";
  // One button: the state's own action, else Cancel (also in the menu).
  const button =
    state === "running"
      ? { label: "Pause", icon: Icons.pause, onPress: () => pauseDownload(id) }
      : state === "paused"
        ? {
            label: "Resume",
            icon: Icons.play,
            onPress: () => resumeDownload(id),
          }
        : failed
          ? {
              label: "Retry",
              icon: Icons.refresh,
              onPress: () => retryDownload(id),
            }
          : {
              label: "Cancel",
              icon: Icons.close,
              onPress: () => cancelDownload(id),
            };

  return (
    <Box
      modifiers={[padding(GUTTER, index > 0 ? SEGMENTED_GAP : 0, GUTTER, 0)]}
    >
      <ContextMenu items={downloadRowMenu(id, { state, canMoveUp })}>
        <SegmentedListItem
          index={index}
          count={count}
          colors={{ containerColor: m3.surfaceContainerHigh }}
        >
          <SegmentedListItem.Leading>
            {cover ? (
              <Image
                source={{ uri: cover }}
                modifiers={[size(28, 40), clip(Shapes.RoundedCorner(6))]}
              />
            ) : (
              <Box modifiers={[size(28, 40)]} />
            )}
          </SegmentedListItem.Leading>
          <Text maxLines={1} overflow="ellipsis">
            {title}
          </Text>
          <SegmentedListItem.Supporting>
            {state === "running" ? (
              <Computed>
                {() => {
                  const value = downloadProgress$[id].get() ?? 0;
                  return (
                    <Column verticalArrangement={{ spacedBy: 4 }}>
                      <Text style={{ typography: "bodyMedium" }}>
                        {`${source} · ${Math.round(value * 100)}%`}
                      </Text>
                      <Progress value={value} maxValue={1} size="sm" />
                    </Column>
                  );
                }}
              </Computed>
            ) : (
              <Text
                style={{ typography: "bodyMedium" }}
                color={failed ? m3.error : undefined}
                maxLines={2}
                overflow="ellipsis"
              >
                {line}
              </Text>
            )}
          </SegmentedListItem.Supporting>
          {/* Kept mounted: a Compose slot added later doesn't show. */}
          <SegmentedListItem.Trailing>
            <IconButton onClick={button.onPress}>
              <Icon
                name={button.icon}
                accessibilityLabel={`${button.label} ${title}`}
                color="inherit"
              />
            </IconButton>
          </SegmentedListItem.Trailing>
        </SegmentedListItem>
      </ContextMenu>
    </Box>
  );
});
