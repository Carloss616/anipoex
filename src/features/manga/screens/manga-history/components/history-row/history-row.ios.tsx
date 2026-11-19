import { Button, HStack, Spacer, VStack, ZStack } from "@expo/ui/swift-ui";
import {
  backgroundOverlay,
  buttonStyle,
  clipShape,
  foregroundStyle,
  frame,
  lineLimit,
  offset,
} from "@expo/ui/swift-ui/modifiers";
import { memo } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { Icon } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { useThemeColor } from "@/hooks/use-theme-color";
import { KIND_ICON } from "../../constants";
import {
  activityTime,
  historyAction,
  historyKind,
} from "../../utils/history-action";
import { openManga, rowMenu } from "../../utils/row-menu";
import type { HistoryRowProps } from "./history-row";

/** A `List` row: tap opens the manga, long-press can filter by it. */
export const HistoryRow = memo(function HistoryRow({
  activity,
  filtered,
}: HistoryRowProps) {
  const [read, add, done, pause, drop] = useThemeColor([
    "primary",
    "info",
    "success",
    "warning",
    "destructive",
  ]);
  const { media } = activity;
  const title = media?.title?.userPreferred ?? "";
  const kind = historyKind(activity.status);
  const cover = media?.coverImage?.medium;

  const row = (
    <HStack spacing={12} modifiers={ROW_FILL}>
      <ZStack alignment="bottomTrailing">
        {cover ? (
          <Image
            source={{ uri: cover }}
            modifiers={[
              frame({ width: 34, height: 50 }),
              clipShape("roundedRectangle", 6),
            ]}
          />
        ) : (
          <Spacer modifiers={[frame({ width: 34, height: 50 })]} />
        )}
        <Icon
          name={KIND_ICON[kind]}
          size={9}
          color="#FFFFFF"
          modifiers={[
            frame({ width: 18, height: 18 }),
            backgroundOverlay({
              color: { read, add, done, pause, drop }[kind],
            }),
            clipShape("circle"),
            offset({ x: 5, y: 5 }),
          ]}
        />
      </ZStack>
      <VStack alignment="leading" spacing={2}>
        <Text weight="semibold" modifiers={[lineLimit(1)]}>
          {title}
        </Text>
        <Text
          textStyle="subheadline"
          modifiers={[foregroundStyle("secondary"), lineLimit(1)]}
        >
          {historyAction(activity)}
        </Text>
      </VStack>
      <Spacer />
      <Text textStyle="footnote" modifiers={[foregroundStyle("secondary")]}>
        {activityTime(activity.createdAt)}
      </Text>
    </HStack>
  );

  if (!media) return row;
  return (
    <ContextMenu items={rowMenu(media.id, filtered)}>
      <Button
        onPress={() => openManga(media.id)}
        modifiers={[buttonStyle("plain")]}
      >
        {row}
      </Button>
    </ContextMenu>
  );
});
