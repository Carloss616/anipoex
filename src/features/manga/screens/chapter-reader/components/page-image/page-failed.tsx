import { Button as NativeButton } from "panelui-native/components/button";
import { Typography } from "panelui-native/components/typography";
import { Button as WebButton } from "panelui-web/button";
import { Platform, View } from "react-native";
import { useThemeM3Colors } from "@/hooks/use-theme";

export interface PageFailedProps {
  index: number;
  /** The page's width over height, or the placeholder's. */
  ratio: number;
  onRetry: () => void;
}

/** A page that couldn't load, in its place, with a retry. */
export function PageFailed({ index, ratio, onRetry }: PageFailedProps) {
  const m3 = useThemeM3Colors();

  return (
    <View
      className="bg-muted w-full items-center justify-center gap-3"
      style={{ aspectRatio: ratio, backgroundColor: m3?.onSurfaceVariant }}
    >
      <Typography type="small" muted>
        Couldn't load page {index + 1}
      </Typography>
      {Platform.OS === "web" ? (
        <WebButton variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </WebButton>
      ) : (
        <NativeButton variant="secondary" size="sm" onPress={onRetry}>
          Retry
        </NativeButton>
      )}
    </View>
  );
}
