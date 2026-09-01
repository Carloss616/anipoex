import { useFragment } from "@apollo/client/react";
import { Item } from "panelui-native/components/item";
import { cn } from "panelui-native/utils/cn";
import { Fragment } from "react";
import { EmptyState } from "@/components/empty-state";
import { MangaDetailFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import type { CHAPTERS } from "../../../../mocks";
import { DownloadButton } from "../download-button";

export interface ChaptersProps extends Pick<MangaDetail, "id" | "__typename"> {
  chapters: typeof CHAPTERS;
}

export function Chapters({ id, __typename, chapters }: ChaptersProps) {
  const { data } = useFragment({
    fragment: MangaDetailFragmentDoc,
    fragmentName: "MangaDetail",
    from: { __typename, id },
  });

  const progress = data?.mediaListEntry?.progress ?? 0;

  if (!chapters.length) return <EmptyState title="No chapters available" />;

  return (
    <Item.Group>
      {chapters.map((chapter, index) => (
        <Fragment key={chapter.id}>
          {index > 0 && <Item.Separator className="mx-4" />}
          <Item>
            <Item.Content className={cn(progress > chapter.id && "opacity-40")}>
              <Item.Title>{chapter.title}</Item.Title>
              <Item.Description>{chapter.date}</Item.Description>
            </Item.Content>
            <Item.Actions>
              <DownloadButton />
            </Item.Actions>
          </Item>
        </Fragment>
      ))}
    </Item.Group>
  );
}
