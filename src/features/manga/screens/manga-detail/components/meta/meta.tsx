import { cn } from "panelui-native/utils/cn";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import { STATUS_COLOR } from "@/features/manga/components/manga-card/constants";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { metaLines } from "./utils/meta-lines";

export function Meta({
  manga,
  className,
}: {
  manga: MangaDetail;
  className?: string;
}) {
  const { synonyms, state } = metaLines(manga);

  return (
    <Column className={cn("gap-2", className)} alignment="start">
      {!!synonyms && (
        <Typography type="body-sm" muted numberOfLines={3}>
          {synonyms}
        </Typography>
      )}

      {!!manga.author && (
        <Row className="gap-2" alignment="center">
          <Icon name={Icons.person} size={12} muted />
          <Typography type="body-sm" weight="medium">
            {manga.author}
          </Typography>
        </Row>
      )}

      {!!state && (
        <Row className="gap-2" alignment="center">
          {manga.status ? (
            <Column className="self-auto! w-3" alignment="center">
              <Badge color={STATUS_COLOR[manga.status]} />
            </Column>
          ) : (
            <Icon name={Icons.calendar} size={12} muted />
          )}
          <Typography type="body-sm" muted>
            {state}
          </Typography>
        </Row>
      )}

      {!!manga.averageScore && (
        <Row className="gap-2" alignment="center">
          <Icon name={Icons.star} size={12} muted />
          <Typography type="body-sm" muted>
            {`${manga.averageScore}% community`}
          </Typography>
        </Row>
      )}
    </Column>
  );
}
