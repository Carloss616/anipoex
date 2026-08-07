import {
  ElevatedCard,
  HorizontalDivider,
  ListItem,
} from "@expo/ui/jetpack-compose";
import { clickable } from "@expo/ui/jetpack-compose/modifiers";
import { Fragment } from "react";
import { Typography } from "@/components/ui/typography";
import { noop } from "@/utils/utils";
import { CHAPTERS } from "../../../mocks";
import { DownloadButton } from "./download-button";

export function Chapters() {
  return (
    <ElevatedCard>
      {CHAPTERS.map((chapter, index) => (
        <Fragment key={chapter.id}>
          {index > 0 && <HorizontalDivider />}
          <ListItem
            colors={{ containerColor: "transparent" }}
            modifiers={[clickable(noop)]}
          >
            <ListItem.HeadlineContent>
              <Typography type="body-sm" weight="semibold">
                {chapter.title}
              </Typography>
            </ListItem.HeadlineContent>
            <ListItem.SupportingContent>
              <Typography type="body-xs" color="muted">
                {chapter.date}
              </Typography>
            </ListItem.SupportingContent>
            <ListItem.TrailingContent>
              <DownloadButton />
            </ListItem.TrailingContent>
          </ListItem>
        </Fragment>
      ))}
    </ElevatedCard>
  );
}
