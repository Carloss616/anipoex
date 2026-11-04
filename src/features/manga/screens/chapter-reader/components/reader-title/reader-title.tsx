import { Stack } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { View } from "react-native";
import { useThemeM3Colors } from "@/hooks/use-theme";

export interface ReaderTitleProps {
  title?: string | null;
  /** The chapter's name, under the title. */
  chapter: string;
}

/** The header's two lines: the manga, then the chapter. */
export function ReaderTitle({ title, chapter }: ReaderTitleProps) {
  const m3 = useThemeM3Colors();

  return (
    <Stack.Title asChild>
      <View className="min-w-0 flex-1">
        <Typography
          type="body-sm"
          weight="semibold"
          numberOfLines={1}
          style={{ color: m3?.onSurface }}
        >
          {title}
        </Typography>
        <Typography
          type="body-xs"
          muted
          numberOfLines={1}
          style={{ color: m3?.onSurfaceVariant }}
        >
          {chapter}
        </Typography>
      </View>
    </Stack.Title>
  );
}
