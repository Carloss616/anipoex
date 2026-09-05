import { Spacer } from "@expo/ui";
import { Divider } from "@expo/ui/swift-ui";
import { opacity } from "@expo/ui/swift-ui/modifiers";
import { Fragment } from "react";
import { EmptyState } from "@/components/empty-state";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Feedback } from "@/components/ui/feedback";
import { Surface } from "@/components/ui/surface";
import { Typography } from "@/components/ui/typography";
import { useTrackingEntry } from "@/features/manga/hooks/use-tracking-entry";
import { noop } from "@/utils/utils";
import { DownloadButton } from "../download-button";
import type { ChaptersProps } from "./chapters";

export function Chapters({ entryId, chapters }: ChaptersProps) {
  const progress = useTrackingEntry(entryId)?.progress ?? 0;

  if (!chapters.length) return <EmptyState title="No chapters available" />;

  return (
    <Surface padding="none">
      {chapters.map((chapter, index) => (
        <Fragment key={chapter.id}>
          {index > 0 && <Divider />}
          <Feedback
            key={chapter.id}
            for={Row}
            onPress={noop}
            alignment="center"
            className="gap-2 p-4"
          >
            <Column
              alignment="start"
              className="gap-0.5"
              modifiers={[opacity(progress > chapter.id ? 0.4 : 1)]}
            >
              <Typography type="body-sm" weight="semibold">
                {chapter.title}
              </Typography>
              <Typography type="body-xs" muted>
                {chapter.date}
              </Typography>
            </Column>
            <Spacer />
            <DownloadButton />
          </Feedback>
        </Fragment>
      ))}
    </Surface>
  );
}
