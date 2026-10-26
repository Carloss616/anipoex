import {
  Column,
  // biome-ignore lint/style/noRestrictedImports: opened by long-press, held by the sheet
  DropdownMenu,
  // biome-ignore lint/style/noRestrictedImports: as above
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
import { memo, useState } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { FAR_BEHIND_GAP, REASONS } from "@/features/manga/utils/msu";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { useMatchUrl } from "../hooks/use-match-url";
import { useSearching } from "../hooks/use-searching";
import { useSourceScan } from "../hooks/use-source-scan";
import { Rail } from "../rail";
import { RefreshIcon } from "../refresh-icon";
import { Tile } from "../tile";
import {
  errorDialog,
  excludeReasons,
  searchItem,
  statusDetail,
} from "../utils/row-content";
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
  const [showError, setShowError] = useState(false);
  // The last read's failure, hidden while the source is read again.
  const error = scanning ? undefined : probe?.error;
  const searching = useSearching(mangaKey, source.id);
  const search = searchItem(source, searching, actions);
  const searchIcon = searching ? Icons.searchTitlesOff : Icons.searchTitles;
  const url = useMatchUrl(mangaKey, source.id);

  const item = (
    <ListItem
      colors={{ containerColor: "transparent" }}
      modifiers={[
        combinedClickable({
          onClick: select,
          onLongClick: () => onMenu?.(source.id),
        }),
      ]}
    >
      <ListItem.LeadingContent>
        <Tile source={source} />
      </ListItem.LeadingContent>
      <ListItem.HeadlineContent>
        <Text style={{ fontWeight: "500" }}>
          {source.baseName ?? source.name}
        </Text>
      </ListItem.HeadlineContent>
      <ListItem.SupportingContent>
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 6 }}>
          {source.lang && <Badge>{source.lang.toUpperCase()}</Badge>}
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
          {/* Its own click, consumed before the row's, so rescanning never selects; off only while this source scans. */}
          <IconButton
            enabled={!scanning}
            onClick={() => actions.rescan(source.id)}
            modifiers={[
              // A disabled button passes the tap to the row; this outer no-op takes it on the same node, so TalkBack still reads one disabled button.
              ...(scanning ? [clickable(() => {}, { indication: false })] : []),
              semantics({ contentDescription: `Rescan ${source.name}` }),
            ]}
          >
            <RefreshIcon spinning={scanning} />
          </IconButton>
          {/* Its own click, so TalkBack still finds a radio next to the row's long-press. */}
          <RadioButton selected={selected} onClick={select} />
          {/* A dialog window, not laid out in the row. */}
          {error && (
            <Dialog
              {...errorDialog(source.name, error)}
              open={showError}
              onOpenChange={setShowError}
              onConfirm={() => actions.rescan(source.id)}
            />
          )}
        </Row>
      </ListItem.TrailingContent>
    </ListItem>
  );

  return (
    <Column>
      <DropdownMenu
        expanded={menuOpen}
        onDismissRequest={() => onMenu?.(null)}
        modifiers={[fillMaxWidth()]}
      >
        <DropdownMenu.Trigger>{item}</DropdownMenu.Trigger>
        <DropdownMenu.Items>
          <DropdownMenuItem
            onClick={() => {
              onMenu?.(null);
              search.onPress();
            }}
          >
            <DropdownMenuItem.Text>
              <Text style={{ typography: "labelLarge" }}>{search.label}</Text>
            </DropdownMenuItem.Text>
            <DropdownMenuItem.LeadingIcon>
              <Icon name={searchIcon} size={BUTTON_ICON_SIZE} />
            </DropdownMenuItem.LeadingIcon>
          </DropdownMenuItem>
          {(url || source.homeUrl) && (
            <DropdownMenuItem
              onClick={() => {
                onMenu?.(null);
                actions.openWebsite(source, url);
              }}
            >
              <DropdownMenuItem.Text>
                <Text style={{ typography: "labelLarge" }}>Open website</Text>
              </DropdownMenuItem.Text>
              <DropdownMenuItem.LeadingIcon>
                <Icon name={Icons.website} size={BUTTON_ICON_SIZE} />
              </DropdownMenuItem.LeadingIcon>
            </DropdownMenuItem>
          )}
          {error && (
            <DropdownMenuItem
              onClick={() => {
                onMenu?.(null);
                setShowError(true);
              }}
            >
              <DropdownMenuItem.Text>
                <Text style={{ typography: "labelLarge" }}>See error</Text>
              </DropdownMenuItem.Text>
              <DropdownMenuItem.LeadingIcon>
                <Icon name={Icons.error} size={BUTTON_ICON_SIZE} />
              </DropdownMenuItem.LeadingIcon>
            </DropdownMenuItem>
          )}
          {selected && (
            <DropdownMenuItem
              onClick={() => {
                onMenu?.(null);
                actions.deselect(source.id);
              }}
            >
              <DropdownMenuItem.Text>
                <Text style={{ typography: "labelLarge" }}>Deselect</Text>
              </DropdownMenuItem.Text>
              <DropdownMenuItem.LeadingIcon>
                <Icon name={Icons.deselect} size={BUTTON_ICON_SIZE} />
              </DropdownMenuItem.LeadingIcon>
            </DropdownMenuItem>
          )}
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
              <DropdownMenuItem.LeadingIcon>
                <Icon name={Icons.exclude} size={BUTTON_ICON_SIZE} />
              </DropdownMenuItem.LeadingIcon>
            </DropdownMenuItem>
          ))}
        </DropdownMenu.Items>
      </DropdownMenu>
      <Rail
        mangaKey={mangaKey}
        mangaId={Number(mangaKey)}
        source={source}
        actions={actions}
      />
    </Column>
  );
});
