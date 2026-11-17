import { Box, IconButton } from "@expo/ui/jetpack-compose";
import { padding } from "@expo/ui/jetpack-compose/modifiers";
import { memo } from "react";
import { GUTTER } from "@/components/native/constants";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { retryUnsent } from "@/features/activity/utils/actions";
import { unsentMenu } from "@/features/activity/utils/row-menu";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { useUnsentItem } from "./hooks/use-unsent-item";
import type { UnsentItemProps } from "./unsent-item";

export const UnsentItem = memo(function UnsentItem({
  id,
  index = 0,
  count = 1,
}: UnsentItemProps) {
  const { title, error } = useUnsentItem(id);
  const m3 = useThemeM3Colors();

  return (
    <Box
      modifiers={[padding(GUTTER, index > 0 ? SEGMENTED_GAP : 0, GUTTER, 0)]}
    >
      <ContextMenu items={unsentMenu(id)}>
        <SegmentedListItem
          index={index}
          count={count}
          colors={{ containerColor: m3.surfaceContainerHigh }}
        >
          <Text maxLines={1} overflow="ellipsis">
            {title}
          </Text>
          <SegmentedListItem.Supporting>
            <Text
              style={{ typography: "bodyMedium" }}
              color={m3.error}
              maxLines={2}
              overflow="ellipsis"
            >
              {error}
            </Text>
          </SegmentedListItem.Supporting>
          <SegmentedListItem.Trailing>
            <IconButton onClick={() => retryUnsent(id)}>
              <Icon
                name={Icons.refresh}
                accessibilityLabel={`Retry ${title}`}
                color="inherit"
              />
            </IconButton>
          </SegmentedListItem.Trailing>
        </SegmentedListItem>
      </ContextMenu>
    </Box>
  );
});
