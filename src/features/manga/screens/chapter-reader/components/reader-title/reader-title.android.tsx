import { Column } from "@expo/ui/jetpack-compose";
import { Stack } from "expo-router";
import { Text } from "@/components/native/jetpack-compose/text";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { ReaderTitleProps } from "./reader-title";

/**
 * In Compose, for the Android app bar's title slot: M3 Expressive's title and
 * subtitle styles.
 */
export function ReaderTitle({ title, chapter }: ReaderTitleProps) {
  const m3 = useThemeM3Colors();

  return (
    <Stack.Title asChild>
      <Column>
        <Text
          style={{ typography: "titleMedium" }}
          maxLines={1}
          overflow="ellipsis"
        >
          {title ?? ""}
        </Text>
        <Text
          style={{ typography: "labelMedium" }}
          color={m3.onSurfaceVariant}
          maxLines={1}
          overflow="ellipsis"
        >
          {chapter}
        </Text>
      </Column>
    </Stack.Title>
  );
}
