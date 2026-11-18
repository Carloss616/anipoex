import { Box } from "@expo/ui/jetpack-compose";
import { padding } from "@expo/ui/jetpack-compose/modifiers";
import { router } from "expo-router";
import { GUTTER } from "@/components/native/constants";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { useDownloadsRow } from "./hooks/use-downloads-row";

export function DownloadsRow() {
  const { label } = useDownloadsRow();
  const m3 = useThemeM3Colors();

  return (
    <Box modifiers={[padding(GUTTER, 0, GUTTER, 0)]}>
      <SegmentedListItem
        index={0}
        count={1}
        colors={{ containerColor: m3.surfaceContainerHigh }}
        onPress={() => router.navigate("/settings/activity")}
      >
        <SegmentedListItem.Leading>
          <Icon name={Icons.download} color="inherit" />
        </SegmentedListItem.Leading>
        <Text>{label}</Text>
        <SegmentedListItem.Supporting>
          <Text style={{ typography: "bodyMedium" }}>
            Paused until you're back online
          </Text>
        </SegmentedListItem.Supporting>
        <SegmentedListItem.Trailing>
          <Icon name={Icons.chevronRight} color="inherit" />
        </SegmentedListItem.Trailing>
      </SegmentedListItem>
    </Box>
  );
}
