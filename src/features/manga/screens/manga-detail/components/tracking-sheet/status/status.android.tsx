import BookmarkIcon from "@expo/material-symbols/bookmark.xml";
import CancelIcon from "@expo/material-symbols/cancel.xml";
import MenuBookIcon from "@expo/material-symbols/menu_book.xml";
import ReplayIcon from "@expo/material-symbols/replay.xml";
import { Column } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  selectableGroup,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, type IconName, Icons } from "@/components/ui/icon";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import { MediaListStatus } from "@/graphql/types.generated";
import { ChangesPreview } from "../changes-preview";
import { Footer } from "../footer";
import { useStatus } from "./hooks/use-status";
import type { StatusProps } from "./status";

const STATUS_ICON: Record<MediaListStatus, IconName> = {
  [MediaListStatus.Current]: MenuBookIcon,
  [MediaListStatus.Planning]: BookmarkIcon,
  [MediaListStatus.Completed]: Icons.checkCircle,
  [MediaListStatus.Paused]: Icons.pause,
  [MediaListStatus.Dropped]: CancelIcon,
  [MediaListStatus.Repeating]: ReplayIcon,
};

export function Status({ form, total, onCancel, onConfirm }: StatusProps) {
  const { isLandscape } = useBreakpoint();
  const { selected, setSelected, next, dirty, changes } = useStatus(
    form,
    total,
  );

  return (
    <Column modifiers={[padding(0, 0, 0, 16)]}>
      <Text
        style={{ typography: "titleLarge" }}
        maxLines={1}
        overflow="ellipsis"
        modifiers={[padding(16, 0, 16, 0)]}
      >
        Status
      </Text>

      <Column
        modifiers={[
          fillMaxWidth(),
          ...(isLandscape ? [weight(1)] : []),
          verticalScroll(),
          padding(16, 16, 16, 16),
        ]}
      >
        {/* M3 single-select list: each row is a radio, the group one choice. */}
        <Column
          verticalArrangement={{ spacedBy: SEGMENTED_GAP }}
          modifiers={[selectableGroup()]}
        >
          {MANGA_STATUS_ENTRIES.map(([status, title], index) => (
            <SegmentedListItem
              key={status}
              index={index}
              count={MANGA_STATUS_ENTRIES.length}
              selected={selected === status}
              onPress={() => setSelected(status)}
            >
              <SegmentedListItem.Leading>
                <Icon name={STATUS_ICON[status]} color="inherit" />
              </SegmentedListItem.Leading>
              <Text>{title}</Text>
            </SegmentedListItem>
          ))}
        </Column>
      </Column>

      <ChangesPreview changes={changes} />

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(next)}
        canConfirm={dirty}
      />
    </Column>
  );
}
