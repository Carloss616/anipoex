import { Box, Column, TextButton } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  onVisibilityChanged,
  padding,
} from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { Loader } from "@/components/ui/loader";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { ListFooterProps } from "./list-footer";

/**
 * The list's last item: in view, it asks for the next page
 * (`onVisibilityChanged`, since `LazyColumn` has no end-reached event).
 */
export function ListFooter({ moreFailed, ended, onLoadMore }: ListFooterProps) {
  const m3 = useThemeM3Colors();
  const muted = {
    style: { typography: "bodyMedium" as const },
    color: m3.onSurfaceVariant,
  };

  if (moreFailed)
    return (
      <Column
        horizontalAlignment="center"
        modifiers={[fillMaxWidth(), padding(16, 16, 16, 24)]}
      >
        <Text {...muted}>Couldn't load older activity</Text>
        <TextButton onClick={onLoadMore}>
          <Text style={{ typography: "labelLarge" }}>Retry</Text>
        </TextButton>
      </Column>
    );
  if (ended)
    return (
      <Column
        horizontalAlignment="center"
        modifiers={[fillMaxWidth(), padding(16, 16, 16, 24)]}
      >
        <Text {...muted}>That's all since you joined AniList</Text>
      </Column>
    );
  return (
    <Box
      contentAlignment="center"
      modifiers={[
        fillMaxWidth(),
        padding(16, 16, 16, 24),
        onVisibilityChanged((visible) => visible && onLoadMore(), {
          minFractionVisible: 0.1,
        }),
      ]}
    >
      <Loader />
    </Box>
  );
}
