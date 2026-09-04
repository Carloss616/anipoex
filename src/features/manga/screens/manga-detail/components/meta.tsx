import { useIsPreview } from "expo-router";
import { cn } from "panelui-native/utils/cn";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import { STATUS_COLOR } from "@/features/manga/components/manga-card/constants";
import { PUBLICATION_STATUSES } from "@/features/manga/constants";
import type { MangaDetail } from "@/features/manga/utils/to-detail";

export function Meta({
  manga,
  className,
}: {
  manga: MangaDetail;
  className: string;
}) {
  const isPreview = useIsPreview();
  const state = [
    manga.status ? PUBLICATION_STATUSES[manga.status] : undefined,
    manga.startDate?.year,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Column className={cn("gap-2", className)} alignment="start">
      <Typography type="h3" className={cn(!isPreview && "hidden")}>
        {manga.title?.userPreferred}
      </Typography>

      {!!manga.author && (
        <Row className="gap-2" alignment="center">
          <Icon
            name={Icon.select({
              ios: "person",
              android: require("@expo/material-symbols/person.xml"),
              web: "user",
            })}
            size={12}
            muted
          />
          <Typography type="body-sm" weight="medium">
            {manga.author}
          </Typography>
        </Row>
      )}

      {!!state && (
        <Row className="gap-2" alignment="center">
          {manga.status ? (
            <Column className="web:self-auto! w-3" alignment="center">
              <Badge color={STATUS_COLOR[manga.status]} />
            </Column>
          ) : (
            <Icon
              name={Icon.select({
                ios: "calendar",
                android: require("@expo/material-symbols/calendar_today.xml"),
                web: "calendar",
              })}
              size={12}
              muted
            />
          )}
          <Typography type="body-sm" muted>
            {state}
          </Typography>
        </Row>
      )}

      {!!manga.averageScore && (
        <Row className="gap-2" alignment="center">
          <Icon
            name={Icon.select({
              ios: "star",
              android: require("@expo/material-symbols/star.xml"),
              web: "star",
            })}
            size={12}
            muted
          />
          <Typography type="body-sm" muted>
            {`${manga.averageScore}% community`}
          </Typography>
        </Row>
      )}
    </Column>
  );
}
