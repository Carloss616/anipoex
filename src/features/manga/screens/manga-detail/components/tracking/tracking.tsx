import { Spacer } from "@expo/ui";
import { useState } from "react";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon, Icons } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Typography } from "@/components/ui/typography";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { TrackingSheet } from "../tracking-sheet";
import { useTrackingSummary } from "./use-tracking-summary";

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
        <Column className="w-full gap-2">
          <Row alignment="center" className="gap-2">
            <Badge color={label ? "primary" : "secondary"} />
            <Typography>{label ?? "Not in list"}</Typography>
            <Spacer flexible />
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
              size={18}
              className="text-primary"
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
