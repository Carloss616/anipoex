import {
  DropdownMenu,
  DropdownMenuItem,
  IconButton,
  ListItem,
  RadioButton,
  Row,
} from "@expo/ui/jetpack-compose";
import {
  clickable,
  combinedClickable,
  fillMaxWidth,
  semantics,
} from "@expo/ui/jetpack-compose/modifiers";
import { Computed } from "@legendapp/state/react";
import { memo } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { isScanBusy } from "@/features/manga/state/probes";
import { FAR_BEHIND_GAP, REASONS } from "@/features/manga/utils/msu";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { useSourceScan } from "../hooks/use-source-scan";
import { RefreshIcon } from "../refresh-icon";
import { Tile } from "../tile";
import { excludeReasons, statusDetail } from "../utils/row-content";
import { sourceStatus } from "../utils/source-status";
import type { AvailableItemProps } from "./available-item";

export const AvailableItem = memo(function AvailableItem({
  source,
  mangaKey,
  sources,
  read,
  openedAt,
  selected,
  menuOpen = false,
  actions,
  onSelect,
  onMenu,
}: AvailableItemProps) {
  const m3 = useThemeM3Colors();
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
  const select = () => onSelect(source.id);

  const item = (
    <ListItem
      colors={{ containerColor: "transparent" }}
      modifiers={[
        combinedClickable({
          onClick: select,
          // The selected source can't be excluded, so its long-press has no menu.
          onLongClick: selected ? undefined : () => onMenu?.(source.id),
        }),
      ]}
    >
      <ListItem.LeadingContent>
        <Tile source={source} />
      </ListItem.LeadingContent>
      <ListItem.HeadlineContent>
        <Text style={{ fontWeight: "500" }}>{source.name}</Text>
      </ListItem.HeadlineContent>
      <ListItem.SupportingContent>
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 6 }}>
          {scanning ? (
            <Badge>scanning…</Badge>
          ) : (
            <Badge color={status.color}>{status.label}</Badge>
          )}
          {detail !== "" && (
            // The badge's labelSmall: a second baseline makes M3's ListItem a top-aligned three-line row.
            <Text
              style={{ typography: "labelSmall", fontWeight: "400" }}
              color={m3.onSurfaceVariant}
              maxLines={1}
              overflow="ellipsis"
            >
              {detail}
            </Text>
          )}
        </Row>
      </ListItem.SupportingContent>
      <ListItem.TrailingContent>
        <Row verticalAlignment="center">
          <Computed>
            {() => {
              const busy = isScanBusy(mangaKey);
              return (
                // Its own click, consumed before the row's, so rescanning never selects.
                <IconButton
                  enabled={!busy}
                  onClick={() => actions.rescan(source.id)}
                  colors={{ contentColor: m3.onSurfaceVariant }}
                  modifiers={[
                    // A disabled button passes the tap to the row; this outer no-op takes it on the same node, so TalkBack still reads one disabled button.
                    ...(busy
                      ? [clickable(() => {}, { indication: false })]
                      : []),
                    semantics({ contentDescription: `Rescan ${source.name}` }),
                  ]}
                >
                  <RefreshIcon spinning={scanning} />
                </IconButton>
              );
            }}
          </Computed>
          {/* Its own click, so TalkBack still finds a radio next to the row's long-press. */}
          <RadioButton selected={selected} onClick={select} />
        </Row>
      </ListItem.TrailingContent>
    </ListItem>
  );

  return selected ? (
    item
  ) : (
    <DropdownMenu
      expanded={menuOpen}
      onDismissRequest={() => onMenu?.(null)}
      modifiers={[fillMaxWidth()]}
    >
      <DropdownMenu.Trigger>{item}</DropdownMenu.Trigger>
      <DropdownMenu.Items>
        {excludeReasons(suspicious).map((reason) => (
          <DropdownMenuItem
            key={reason}
            onClick={() => {
              onMenu?.(null);
              actions.exclude(source.id, reason);
            }}
          >
            <DropdownMenuItem.Text>
              <Text style={{ typography: "labelLarge" }}>
                {`Exclude: ${REASONS[reason].menu}`}
              </Text>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
        ))}
      </DropdownMenu.Items>
    </DropdownMenu>
  );
});
