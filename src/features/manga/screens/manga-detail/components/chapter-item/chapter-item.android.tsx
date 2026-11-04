import { IconButton, ListItem, Row } from "@expo/ui/jetpack-compose";
import {
  alpha,
  clickable,
  semantics,
} from "@expo/ui/jetpack-compose/modifiers";
import { useRouter } from "expo-router";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { noop } from "@/utils/utils";
import type { ChapterItemProps } from "./chapter-item";
import { useChapterRead } from "./hooks/use-chapter-read";
import { useIsNext } from "./hooks/use-is-next";

export function ChapterItem({
  chapter,
  mediaId,
  entryId,
  continue$,
}: ChapterItemProps) {
  const router = useRouter();
  const read = useChapterRead(entryId, chapter.number);
  const next = useIsNext(continue$, chapter.id);
  const m3 = useThemeM3Colors();

  return (
    <ListItem
      colors={{ containerColor: "transparent" }}
      modifiers={[
        clickable(() =>
          router.push({
            pathname: "/manga/[id]/reader",
            params: {
              id: mediaId,
              chapter: chapter.id,
            },
          }),
        ),
        ...(read ? [alpha(0.64)] : []),
      ]}
    >
      <ListItem.HeadlineContent>
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 6 }}>
          {read && (
            <Icon
              name={Icons.read}
              size={14}
              color={m3.primary}
              modifiers={[semantics({ contentDescription: "Read" })]}
            />
          )}
          {next && <Badge color="primary" />}
          <Text style={{ fontWeight: "500" }} maxLines={1} overflow="ellipsis">
            {chapter.title}
          </Text>
        </Row>
      </ListItem.HeadlineContent>
      {/* An empty slot still takes a line and lifts the title off center. */}
      {chapter.date !== "" && (
        <ListItem.SupportingContent>
          <Text style={{ typography: "bodyMedium" }}>{chapter.date}</Text>
        </ListItem.SupportingContent>
      )}
      <ListItem.TrailingContent>
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 4 }}>
          {next && <Badge color="primary">Next</Badge>}
          <IconButton
            onClick={noop}
            modifiers={[
              semantics({
                contentDescription: `Download chapter ${chapter.title}`,
              }),
            ]}
          >
            <Icon
              name={Icons.download}
              size={BUTTON_ICON_SIZE}
              color="inherit"
            />
          </IconButton>
        </Row>
      </ListItem.TrailingContent>
    </ListItem>
  );
}
