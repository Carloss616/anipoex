import { Typography } from "panelui-native/components/typography";
import { Button } from "panelui-web/button";
import { useState } from "react";
import { View } from "react-native";
import { Icon, Icons } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { TrackingSheet } from "../tracking-sheet";
import { useTrackingSummary } from "./hooks/use-tracking-summary";

/** A card summing the entry up, or inviting to add one; the sheet edits it. */
export function Tracking({ manga }: { manga: MangaDetail }) {
  const [isPresented, setIsPresented] = useState(false);
  const { tracking, label, total, progress, percent } =
    useTrackingSummary(manga);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsPresented(true)}
        className="h-auto flex-col items-stretch rounded-2xl p-4"
      >
        {label ? (
          <>
            <View className="flex-row items-center gap-2">
              <Typography className="text-inherit">{label}</Typography>
              <View className="flex-1" />
              <Typography.Code className="self-auto">
                {progress}
                {!!total && `/${total}`}
              </Typography.Code>
              {!!total && (
                <Typography type="body-xs" muted>
                  {percent}%
                </Typography>
              )}
              <Icon name={Icons.chevronRight} />
            </View>
            {!!total && <Progress value={percent} />}
          </>
        ) : (
          <View className="flex-row items-center gap-2">
            <Typography className="text-inherit">Add to list</Typography>
            <View className="flex-1" />
            <Icon name={Icons.add} />
          </View>
        )}
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
