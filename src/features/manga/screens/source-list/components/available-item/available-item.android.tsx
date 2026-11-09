import { Column, Row } from "@expo/ui/jetpack-compose";
import { padding } from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { GUTTER } from "@/components/native/constants";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { challenged$ } from "@/features/manga/state/challenged";
import { FAR_BEHIND_GAP } from "@/features/manga/utils/msu";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { useMatchUrl } from "../../hooks/use-match-url";
import { useSearching } from "../../hooks/use-searching";
import { useSourceScan } from "../../hooks/use-source-scan";
import { statusDetail } from "../../utils/row-content";
import { availableRowMenu } from "../../utils/row-menu";
import { sourceStatus } from "../../utils/source-status";
import { Rail } from "../rail";
import { Tile } from "../tile";
import type { AvailableItemProps } from "./available-item";

export const AvailableItem = memo(function AvailableItem({
  source,
  mangaKey,
  sources,
  read,
  openedAt,
  selected,
  index = 0,
  count = 1,
  actions,
  onSelect,
}: AvailableItemProps) {
  const m3 = useThemeM3Colors();
  const challenged = useValue(() => !!challenged$[source.id].get());
  const { probe, scanning, suspicious } = useSourceScan(
    mangaKey,
    source.id,
    sources,
  );
  const status = sourceStatus(
    probe,
    read,
    FAR_BEHIND_GAP,
    suspicious,
    openedAt,
  );
  const detail = statusDetail(status);
  // The last read's failure, hidden while the source is read again.
  const error = scanning ? undefined : probe?.error;
  const searching = useSearching(mangaKey, source.id);
  const url = useMatchUrl(mangaKey, source.id);
  // M3 single-select rows hold no second action: rescan and stop are in the menu.
  const menu = availableRowMenu({
    source,
    url,
    searching,
    scanning,
    error,
    actions,
    selected,
    suspicious,
    withRescan: true,
  });

  return (
    <Column
      modifiers={[padding(GUTTER, index > 0 ? SEGMENTED_GAP : 0, GUTTER, 0)]}
    >
      <ContextMenu items={menu}>
        <SegmentedListItem
          index={index}
          // Its rail takes the group's closing corners when it shows.
          count={searching ? count + 1 : count}
          selected={selected}
          onPress={() => onSelect(source.id)}
        >
          <SegmentedListItem.Leading>
            <Tile source={source} loading={scanning} />
          </SegmentedListItem.Leading>
          <Text style={{ fontWeight: "500" }}>
            {source.baseName ?? source.name}
          </Text>
          <SegmentedListItem.Supporting>
            <Row
              verticalAlignment="center"
              horizontalArrangement={{ spacedBy: 6 }}
            >
              {source.lang && <Badge>{source.lang.toUpperCase()}</Badge>}
              {challenged && (
                <Badge icon={Icons.cloudflare} label="Cloudflare" />
              )}
              {scanning ? (
                <Badge>scanning…</Badge>
              ) : (
                <Badge color={status.color}>{status.label}</Badge>
              )}
              {detail.chapter && <Badge>{detail.chapter}</Badge>}
              {detail.age && (
                <Text
                  style={{ typography: "labelSmall", fontWeight: "400" }}
                  color={m3.onSurfaceVariant}
                  maxLines={1}
                  overflow="ellipsis"
                >
                  {detail.age}
                </Text>
              )}
            </Row>
          </SegmentedListItem.Supporting>
        </SegmentedListItem>
      </ContextMenu>
      <Rail
        mangaKey={mangaKey}
        mangaId={Number(mangaKey)}
        source={source}
        actions={actions}
        selected={selected}
        last={index === count - 1}
      />
    </Column>
  );
});
