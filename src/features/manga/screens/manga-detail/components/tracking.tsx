import { Spacer } from "@expo/ui";
import { useState } from "react";
import { Platform } from "react-native";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Typography } from "@/components/ui/typography";
import { MANGA_STATUSES } from "@/features/manga/constants";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { TrackingSheet } from "./tracking-sheet";

export function Tracking({ manga }: { manga: MangaDetail }) {
  const [isPresented, setIsPresented] = useState(false);
  const tracking = useTrackingEntry(manga.mediaListEntry?.id);

  const status = tracking?.status;
  const label = status && MANGA_STATUSES[status];

  const total = manga.chapters;
  const progress = tracking?.progress ?? 0;
  const ratio = total ? Math.min(progress / total, 1) : 0;
  const percent = Math.round(ratio * 100);

  return (
    <>
      <Button
        variant={Platform.select({
          android: "outline",
          default: "secondary",
        })}
        onPress={() => setIsPresented(true)}
        className="h-auto web:w-full web:rounded-full py-4"
      >
        <Column className="web:w-full gap-2">
          <Row alignment="center" className="gap-2">
            <Badge color={label ? "primary" : "secondary"} />
            <Typography className="ios:text-foreground">
              {label ?? "Not in list"}
            </Typography>
            <Spacer flexible />
            <Typography.Code className="web:self-auto">
              {progress}/{total ?? "_"}
            </Typography.Code>
            {!!total && (
              <Typography type="body-xs" muted>
                {percent}%
              </Typography>
            )}
            <Icon
              name={Icon.select({
                ios: "chevron.right",
                android: require("@expo/material-symbols/chevron_right.xml"),
                web: "chevron-right",
              })}
              size={18}
              className="text-inherit web:text-primary"
            />
          </Row>
          <Progress value={percent} />
        </Column>
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
