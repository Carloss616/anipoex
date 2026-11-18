import { Stack } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { View } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

export interface ReaderTitleProps {
  title?: string | null;
  /** The chapter's name, under the title. */
  chapter: string;
}

/** The header's two lines: the manga, then the chapter. */
export function ReaderTitle({ title, chapter }: ReaderTitleProps) {
  // A value, not a class: in iOS's native header the theme's classes don't reach it.
  const [foreground, muted] = useThemeColor(["foreground", "muted-foreground"]);

  return (
    <Stack.Title asChild>
      <View className="min-w-0 flex-1">
        <Typography
          type="body-sm"
          weight="semibold"
          numberOfLines={1}
          style={{ color: foreground }}
        >
          {title}
        </Typography>
        <Typography
          type="body-xs"
          muted
          numberOfLines={1}
          style={{ color: muted }}
        >
          {chapter}
        </Typography>
      </View>
    </Stack.Title>
  );
}
