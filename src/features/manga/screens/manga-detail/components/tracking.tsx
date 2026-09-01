import { useFragment } from "@apollo/client/react";
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
import { MangaDetailFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { MANGA_STATUSES } from "@/features/manga/screens/manga-list/constants";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { toDetail } from "@/features/manga/utils/to-detail";
import { TrackingSheet } from "./tracking-sheet";

export function Tracking({
  id,
  __typename,
}: Pick<MangaDetail, "id" | "__typename">) {
  const [isPresented, setIsPresented] = useState(false);
  const { data } = useFragment({
    fragment: MangaDetailFragmentDoc,
    fragmentName: "MangaDetail",
    from: { __typename, id },
  });

  const status = data.mediaListEntry?.status;
  const label =
    MANGA_STATUSES.find((s) => s.status === status)?.title ??
    status ??
    "Not in list";

  const total = data.chapters;
  const progress = data.mediaListEntry?.progress ?? 0;
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
            <Badge color="primary" />
            <Typography className="ios:text-foreground">{label}</Typography>
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
        manga={toDetail(id, data)}
        onDismiss={() => setIsPresented(false)}
      />
    </>
  );
}
