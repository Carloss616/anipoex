import { Typography } from "panelui-native/components/typography";
import { useState } from "react";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { TrackingSheet } from "../tracking-sheet";
import { useTrackingSummary } from "./hooks/use-tracking-summary";

export function Tracking({ manga }: { manga: MangaDetail }) {
  const [isPresented, setIsPresented] = useState(false);
  const { tracking, label, total, progress, percent } =
    useTrackingSummary(manga);

  return (
    <>
      <Button
        variant="secondary"
        onPress={() => setIsPresented(true)}
        className="h-auto w-full rounded-full py-4"
      >
        <View className="w-full gap-2">
          <View className="flex-row items-center gap-2">
            <Badge color={label ? "primary" : "secondary"} />
            <Typography>{label ?? "Not in list"}</Typography>
            <View className="flex-1" />
            <Typography.Code className="self-auto">
              {progress}/{total ?? "_"}
            </Typography.Code>
            {!!total && (
              <Typography type="body-xs" muted>
                {percent}%
              </Typography>
            )}
            <Icon
              name={Icons.chevronRight}
              size={BUTTON_ICON_SIZE}
              className="text-primary"
            />
          </View>
          <Progress value={percent} />
        </View>
      </Button>

      <TrackingSheet
        isPresented={isPresented}
        manga={manga}
        tracking={tracking}
        onDismiss={() => setIsPresented(false)}
      />
    </>
  );
}
