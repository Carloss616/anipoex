import { Platform } from "expo";
import { cn } from "panelui-native/utils/cn";
import { Fragment } from "react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { Surface } from "@/components/ui/surface";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import type { CHAPTERS } from "@/features/manga/mocks";
import { noop } from "@/utils/utils";

export interface ChaptersProps {
  entryId: number | null | undefined;
  chapters: typeof CHAPTERS;
}

export function Chapters({ entryId, chapters }: ChaptersProps) {
  const progress = useTrackingEntry(entryId)?.progress ?? 0;

  if (!chapters.length) return <EmptyState title="No chapters available" />;

  return (
    <Surface padding="none" elevated className="web:w-full">
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
                <Button
                  size="icon"
                  className="web:size-9"
                  variant={Platform.OS === "android" ? "ghost" : "outline"}
                  onPress={noop}
                  accessibilityLabel={`Download chapter ${chapter.title}`}
                >
                  <Icon
                    name={Icons.download}
                    size={BUTTON_ICON_SIZE}
                    className="text-inherit web:text-primary"
                  />
                </Button>
              </Item.Actions>
            </Item>
          </Fragment>
        ))}
      </Item.Group>
    </Surface>
  );
}
