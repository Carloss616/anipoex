import { useValue } from "@legendapp/state/react";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu, Menu } from "@/components/ui/menu";
import { challenged$ } from "@/features/manga/state/challenged";
import { FAR_BEHIND_GAP } from "@/features/manga/utils/msu";
import type { Source } from "@/features/manga/utils/source";
import { useMatchUrl } from "../../hooks/use-match-url";
import { useSearching } from "../../hooks/use-searching";
import type { SourceActions } from "../../hooks/use-source-actions";
import { useSourceScan } from "../../hooks/use-source-scan";
import { statusDetail } from "../../utils/row-content";
import { availableRowMenu } from "../../utils/row-menu";
import { sourceStatus } from "../../utils/source-status";
import { Rail } from "../rail";
import { Tile } from "../tile";

// End padding for 2 or 3 buttons (rescan or stop and ⋯, plus the check).
const PADDING = ["pe-27.5", "pe-34"];

/** What the iOS swipe hands the sheet's reason dialog. */
export type ExcludeRequest = { source: Source; suspicious: boolean };

/** What an iOS context menu's See error hands the sheet's dialog. */
export type ErrorRequest = { source: Source; error: string; excluded?: true };

export interface AvailableItemProps {
  source: Source;
  mangaKey: string;
  /** Every installed source: this one's suspicion depends on the rest. */
  sources: Source[];
  read: number;
  /** When the sheet opened: the probe ages count from it. */
  openedAt: number;
  selected: boolean;
  /**
   * Its place in its section, for the group's rounded ends.
   * @platform android
   */
  index?: number;
  /** @platform android */
  count?: number;
  actions: SourceActions;
  onSelect: (id: string) => void;
  /** iOS: the swipe's Exclude asks for a reason in the sheet's dialog. */
  onExclude?: (row: ExcludeRequest) => void;
  /** iOS: See error shows the message in the sheet's dialog. */
  onError?: (row: ErrorRequest) => void;
}

export const AvailableItem = memo(function AvailableItem({
  source,
  mangaKey,
  sources,
  read,
  openedAt,
  selected,
  actions,
  onSelect,
}: AvailableItemProps) {
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
  // Rescan and Stop are buttons on the row here.
  const items = availableRowMenu({
    source,
    url,
    searching,
    scanning,
    error,
    actions,
    selected,
    suspicious,
    withRescan: false,
  });

  return (
    <View>
      <View>
        {/* Right-click opens the ⋯ menu's rows at the pointer. */}
        <ContextMenu items={items}>
          <Frame.Row
            onClick={() => onSelect(source.id)}
            aria-selected={selected}
            className={PADDING[Number(selected)]}
          >
            <Frame.Media>
              <Tile source={source} loading={scanning} />
            </Frame.Media>
            <Frame.Content>
              <Frame.Title as="p">{source.baseName ?? source.name}</Frame.Title>
              <Frame.Description>
                {source.lang && <Badge>{source.lang.toUpperCase()}</Badge>}{" "}
                {challenged && (
                  <>
                    <Badge>Cloudflare</Badge>{" "}
                  </>
                )}
                {scanning ? (
                  <Badge>scanning…</Badge>
                ) : (
                  <Badge color={status.color}>{status.label}</Badge>
                )}{" "}
                {detail.chapter && <Badge>{detail.chapter}</Badge>} {detail.age}
              </Frame.Description>
            </Frame.Content>
          </Frame.Row>
        </ContextMenu>
        {/* Over the row, not in it: a <button> can't hold buttons. */}
        <Frame.Actions className="absolute inset-y-0 inset-e-4">
          {/* A mark, not an action: a disabled button only for the same box
              as ↻ and ⋯, undimmed, and hidden since the row says
              aria-selected. */}
          {selected && (
            <Button
              variant="ghost"
              size="icon"
              className="disabled:opacity-100"
              disabled
              aria-hidden
              aria-label="Selected"
            >
              <Icon name={Icons.check} className="text-primary" />
            </Button>
          )}
          {/* Rescan turns to Stop while it scans: a slow source can scan for minutes. */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              scanning ? actions.stop(source.id) : actions.rescan(source.id)
            }
            aria-label={`${scanning ? "Stop scanning" : "Rescan"} ${source.name}`}
          >
            <Icon name={scanning ? Icons.close : Icons.refresh} />
          </Button>
          <Menu items={items}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`More actions for ${source.name}`}
            >
              <Icon name={Icons.more} />
            </Button>
          </Menu>
        </Frame.Actions>
      </View>
      <Rail
        mangaKey={mangaKey}
        mangaId={Number(mangaKey)}
        source={source}
        actions={actions}
      />
    </View>
  );
});
