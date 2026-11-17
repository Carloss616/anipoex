import { Box } from "@expo/ui/jetpack-compose";
import { padding } from "@expo/ui/jetpack-compose/modifiers";
import { GUTTER } from "@/components/native/constants";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon } from "@/components/ui/icon";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { COPY } from "./constants";
import type { StatusCardProps } from "./status-card";

export function StatusCard({ mode }: StatusCardProps) {
  const { icon, title, description } = COPY[mode];
  const m3 = useThemeM3Colors();

  return (
    <Box modifiers={[padding(GUTTER, 0, GUTTER, 0)]}>
      <SegmentedListItem
        index={0}
        count={1}
        colors={{ containerColor: m3.surfaceContainerHigh }}
      >
        <SegmentedListItem.Leading>
          <Icon name={icon} color="inherit" />
        </SegmentedListItem.Leading>
        <Text>{title}</Text>
        <SegmentedListItem.Supporting>
          <Text style={{ typography: "bodyMedium" }}>{description}</Text>
        </SegmentedListItem.Supporting>
      </SegmentedListItem>
    </Box>
  );
}
