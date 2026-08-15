import { useFragment } from "@apollo/client/react";
import { ListGroup } from "heroui-native/list-group";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { cn } from "panelui-native/utils/cn";
import { EmptyState } from "@/components/empty-state";
import { Separator } from "@/components/ui/separator";
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
    <ListGroup className="w-full p-0">
      {chapters.map((chapter, index) => (
        <PressableFeedback key={chapter.id}>
          {index > 0 && <Separator className="mx-4" />}
          <ListGroup.Item disabled>
            <ListGroup.ItemContent
              className={cn(progress > chapter.id && "opacity-40")}
            >
              <ListGroup.ItemTitle>{chapter.title}</ListGroup.ItemTitle>
              <ListGroup.ItemDescription>
                {chapter.date}
              </ListGroup.ItemDescription>
            </ListGroup.ItemContent>
            <ListGroup.ItemSuffix>
              <DownloadButton />
            </ListGroup.ItemSuffix>
          </ListGroup.Item>
          <PressableFeedback.Highlight />
        </PressableFeedback>
      ))}
    </ListGroup>
  );
}
