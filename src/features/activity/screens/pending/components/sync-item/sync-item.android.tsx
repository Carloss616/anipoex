import { Box, Column } from "@expo/ui/jetpack-compose";
import { padding } from "@expo/ui/jetpack-compose/modifiers";
import { router } from "expo-router";
import { memo } from "react";
import { GUTTER } from "@/components/native/constants";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon } from "@/components/ui/icon";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { TARGETS } from "./constants";
import { useSyncItem } from "./hooks/use-sync-item";
import type { SyncItemProps } from "./sync-item";

export const SyncItem = memo(function SyncItem({
  id,
  index = 0,
  count = 1,
}: SyncItemProps) {
  const { line, unsynced } = useSyncItem(id);
  const { title, icon } = TARGETS[id];
  const m3 = useThemeM3Colors();

  return (
    <Box
      modifiers={[padding(GUTTER, index > 0 ? SEGMENTED_GAP : 0, GUTTER, 0)]}
    >
      <SegmentedListItem
        index={index}
        count={count}
        colors={{ containerColor: m3.surfaceContainerHigh }}
        onPress={() => router.navigate("/settings")}
      >
        <SegmentedListItem.Leading>
          <Icon name={icon} color="inherit" />
        </SegmentedListItem.Leading>
        <Text>{title}</Text>
        {(line !== "" || unsynced !== "") && (
          <SegmentedListItem.Supporting>
            <Column>
              {line !== "" && (
                <Text style={{ typography: "bodyMedium" }}>{line}</Text>
              )}
              {unsynced !== "" && (
                <Text style={{ typography: "bodyMedium" }}>{unsynced}</Text>
              )}
            </Column>
          </SegmentedListItem.Supporting>
        )}
      </SegmentedListItem>
    </Box>
  );
});
