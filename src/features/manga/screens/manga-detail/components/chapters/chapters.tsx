import { Item } from "panelui-native/components/item";
import { cn } from "panelui-native/utils/cn";
import { Fragment } from "react";
import { EmptyState } from "@/components/empty-state";
import { Surface } from "@/components/ui/surface";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import type { CHAPTERS } from "../../../../mocks";
import { DownloadButton } from "../download-button";

export interface ChaptersProps {
  entryId: number | null | undefined;
  chapters: typeof CHAPTERS;
}

export function Chapters({ entryId, chapters }: ChaptersProps) {
  const progress = useTrackingEntry(entryId)?.progress ?? 0;

  if (!chapters.length) return <EmptyState title="No chapters available" />;

  return (
    <Surface padding="none" elevated className="w-full">
      <Item.Group>
        {chapters.map((chapter, index) => (
          <Fragment key={chapter.id}>
            {index > 0 && <Item.Separator className="mx-4" />}
            <Item>
              <Item.Content
                className={cn(progress > chapter.id && "opacity-40")}
              >
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
    </Surface>
  );
}
