import { useFragment } from "@apollo/client/react";
import { Spacer } from "@expo/ui";
import { Platform, View } from "react-native";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Button } from "@/components/ui/button";
import { RNHostView } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Typography } from "@/components/ui/typography";
import { MangaDetailFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { MANGA_STATUSES } from "@/features/manga/screens/manga-list/constants";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { noop } from "@/utils/utils";
import { WEB_ICON_COLOR } from "../constants";

export function Tracking({
  id,
  __typename,
}: Pick<MangaDetail, "id" | "__typename">) {
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
    <Button
      variant={Platform.select({
        android: "outline",
        default: "tertiary",
      })}
      onPress={noop}
      className="h-auto web:w-full web:rounded-full py-4"
    >
      <Column className="web:w-full gap-2">
        <Row alignment="center" className="gap-2">
          <RNHostView matchContents>
            <View className="size-2 rounded-full bg-accent" />
          </RNHostView>
          <Button.Label className="ios:text-foreground">{label}</Button.Label>
          <Spacer flexible />
          <Typography.Code className="web:self-auto">
            {progress}/{total ?? "_"}
          </Typography.Code>
          {!!total && (
            <Typography type="body-xs" color="muted">
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
            colorClassName={WEB_ICON_COLOR}
          />
        </Row>
        <Progress value={ratio} />
      </Column>
    </Button>
  );
}
