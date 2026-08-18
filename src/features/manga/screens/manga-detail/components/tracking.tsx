import { useFragment } from "@apollo/client/react";
import { Spacer } from "@expo/ui";
import { useState } from "react";
import { Platform, View } from "react-native";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Button } from "@/components/ui/button";
import { RNHostView } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Sheet } from "@/components/ui/sheet";
import { Typography } from "@/components/ui/typography";
import { MangaDetailFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { MANGA_STATUSES } from "@/features/manga/screens/manga-list/constants";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { WEB_ICON_COLOR } from "../constants";

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
            <RNHostView matchContents>
              <View className="size-2 rounded-full bg-primary" />
            </RNHostView>
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
              colorClassName={WEB_ICON_COLOR}
            />
          </Row>
          <Progress value={percent} />
        </Column>
      </Button>

      <Sheet
        isPresented={isPresented}
        onDismiss={() => setIsPresented(false)}
        snapPoints={[{ fraction: 0.25 }, { fraction: 0.5 }, { fraction: 0.9 }]}
      >
        <Typography>Render Anilist actions</Typography>
      </Sheet>
    </>
  );
}
