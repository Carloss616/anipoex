import { Column, Row, TextButton } from "@expo/ui/jetpack-compose";
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
import { ContextMenu } from "@/components/ui/menu";
import { probes$, scanning$ } from "@/features/manga/state/probes";
import { REASONS } from "@/features/manga/utils/msu";
import { useMatchUrl } from "../hooks/use-match-url";
import { useSearching } from "../hooks/use-searching";
import { Rail } from "../rail";
import { Tile } from "../tile";
import { excludedBadge } from "../utils/row-content";
import { excludedRowMenu } from "../utils/row-menu";
import type { ExcludedItemProps } from "./excluded-item";

export const ExcludedItem = memo(function ExcludedItem({
  source,
  reason,
  pinned,
  index = 0,
  count = 1,
  mangaKey,
  actions,
}: ExcludedItemProps) {
  // Rechecked or picked by hand, it stays here until its probe judges it.
  const scanning = useValue(
    () => scanning$[mangaKey][source.id].get() === true,
  );
  const lastError = useValue(() => probes$[mangaKey][source.id].error.get());
  // The last read's failure, hidden while the source is read again.
  const error = scanning ? undefined : lastError;
  const searching = useSearching(mangaKey, source.id);
  const url = useMatchUrl(mangaKey, source.id);
  const menu = excludedRowMenu({
    source,
    url,
    searching,
    scanning,
    error,
    actions,
    withStop: true,
    withInclude: false,
  });

  return (
    <Column
      modifiers={[padding(GUTTER, index > 0 ? SEGMENTED_GAP : 0, GUTTER, 0)]}
    >
      {/* No tap of its own: a tap opens the menu as a long press does. */}
      <ContextMenu items={menu}>
        <SegmentedListItem
          index={index}
          // Its rail takes the group's closing corners when it shows.
          count={searching ? count + 1 : count}
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
              {scanning ? (
                <Badge>scanning…</Badge>
              ) : (
                <Badge color={REASONS[reason].color}>
                  {excludedBadge(reason, pinned)}
                </Badge>
              )}
            </Row>
          </SegmentedListItem.Supporting>
          {!scanning && (
            <SegmentedListItem.Trailing>
              <TextButton onClick={() => actions.include(source.id)}>
                <Text style={{ typography: "labelLarge" }}>Include</Text>
              </TextButton>
            </SegmentedListItem.Trailing>
          )}
        </SegmentedListItem>
      </ContextMenu>
      <Rail
        mangaKey={mangaKey}
        mangaId={Number(mangaKey)}
        source={source}
        actions={actions}
        selected={false}
        last={index === count - 1}
      />
    </Column>
  );
});
