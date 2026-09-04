import { useFragment } from "@apollo/client/react";
import { HorizontalDivider, ListItem } from "@expo/ui/jetpack-compose";
import { alpha, clickable } from "@expo/ui/jetpack-compose/modifiers";
import { Fragment } from "react";
import { EmptyState } from "@/components/empty-state";
import { Surface } from "@/components/ui/surface";
import { Typography } from "@/components/ui/typography";
import { MangaDetailFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { noop } from "@/utils/utils";
import { DownloadButton } from "../download-button";
import type { ChaptersProps } from "./chapters";

export function Chapters({ id, __typename, chapters }: ChaptersProps) {
  const { data } = useFragment({
    fragment: MangaDetailFragmentDoc,
    fragmentName: "MangaDetail",
    from: { __typename, id },
  });

  const progress = data?.mediaListEntry?.progress ?? 0;

  if (!chapters.length) return <EmptyState title="No chapters available" />;

  return (
    <Surface padding="none" elevated>
      {chapters.map((chapter, index) => (
        <Fragment key={chapter.id}>
          {index > 0 && <HorizontalDivider />}
          <ListItem
            colors={{ containerColor: "transparent" }}
            modifiers={[
              clickable(noop),
              alpha(progress > chapter.id ? 0.4 : 1),
            ]}
          >
            <ListItem.HeadlineContent>
              <Typography type="body-sm" weight="semibold">
                {chapter.title}
              </Typography>
            </ListItem.HeadlineContent>
            <ListItem.SupportingContent>
              <Typography type="body-xs" muted>
                {chapter.date}
              </Typography>
            </ListItem.SupportingContent>
            <ListItem.TrailingContent>
              <DownloadButton />
            </ListItem.TrailingContent>
          </ListItem>
        </Fragment>
      ))}
    </Surface>
  );
}
