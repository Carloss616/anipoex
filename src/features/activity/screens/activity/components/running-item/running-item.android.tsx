import { Box, Column } from "@expo/ui/jetpack-compose";
import {
  clip,
  padding,
  Shapes,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { Computed, useValue } from "@legendapp/state/react";
import { router } from "expo-router";
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
import { MarkRail } from "@/features/manga/components/mark-rail";
import { activeScans$ } from "@/features/manga/state/active-scans";
import { orderMarks } from "@/features/manga/utils/scan-activity/utils/marks";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { scanProgress } from "../../utils/progress";
import { runningMenu } from "../../utils/row-menu";
import { expanded$, split, toggleExpanded } from "../../utils/state";
import { SourceItem } from "../source-item";
import type { RunningItemProps } from "./running-item";

export const RunningItem = memo(function RunningItem({
  mangaId,
  index = 0,
  count = 1,
}: RunningItemProps) {
  const scan$ = activeScans$[mangaId];
  const name = useValue(scan$.name) ?? "";
  const cover = useValue(scan$.cover);
  const expanded = useValue(() => !!expanded$[mangaId].get());
  const m3 = useThemeM3Colors();
  const id = Number(mangaId);
  const open = () => router.navigate(`/manga/${id}`);

  return (
    <Column>
      <Box
        modifiers={[padding(GUTTER, index > 0 ? SEGMENTED_GAP : 0, GUTTER, 0)]}
      >
        <ContextMenu items={runningMenu(id, { expanded, open })}>
          <SegmentedListItem
            index={index}
            count={count}
            colors={{ containerColor: m3.surfaceContainerHigh }}
            onPress={() => toggleExpanded(id)}
          >
            <SegmentedListItem.Leading>
              {cover ? (
                <Image
                  source={{ uri: cover }}
                  modifiers={[size(34, 48), clip(Shapes.RoundedCorner(6))]}
                />
              ) : (
                <Box modifiers={[size(34, 48)]} />
              )}
            </SegmentedListItem.Leading>
            <Text
              style={{ fontWeight: "500" }}
              maxLines={1}
              overflow="ellipsis"
            >
              {name}
            </Text>
            <SegmentedListItem.Supporting>
              <Computed>
                {() => {
                  const marks = Object.values(scan$.marks.get() ?? {});
                  const { value, line } = scanProgress(marks);
                  return (
                    <Column verticalArrangement={{ spacedBy: 4 }}>
                      {!expanded && <MarkRail marks={orderMarks(marks)} />}
                      <Text style={{ typography: "bodyMedium" }}>{line}</Text>
                      <Progress value={value} maxValue={1} size="sm" />
                    </Column>
                  );
                }}
              </Computed>
            </SegmentedListItem.Supporting>
            {/* Kept mounted: a Compose slot added later doesn't show. */}
            <SegmentedListItem.Trailing>
              <Icon
                name={expanded ? Icons.chevronDown : Icons.chevronRight}
                color="inherit"
              />
            </SegmentedListItem.Trailing>
          </SegmentedListItem>
        </ContextMenu>
      </Box>
      {expanded && <SourceRows mangaId={mangaId} />}
    </Column>
  );
});

function SourceRows({ mangaId }: RunningItemProps) {
  const ids = split(
    useValue(() =>
      Object.keys(activeScans$[mangaId].marks.get(true) ?? {}).join(),
    ),
  );

  return ids.map((sourceId, i) => (
    <SourceItem
      key={sourceId}
      mangaId={mangaId}
      sourceId={sourceId}
      index={i}
      count={ids.length}
    />
  ));
}
