import { useValue } from "@legendapp/state/react";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu, Menu } from "@/components/ui/menu";
import { probes$, scanning$ } from "@/features/manga/state/probes";
import { type ExcludeReason, REASONS } from "@/features/manga/utils/msu";
import type { Source } from "@/features/manga/utils/source";
import { useMatchUrl } from "../../hooks/use-match-url";
import { useSearching } from "../../hooks/use-searching";
import type { SourceActions } from "../../hooks/use-source-actions";
import { excludedBy } from "../../utils/row-content";
import { excludedRowMenu } from "../../utils/row-menu";
import type { ErrorRequest } from "../available-item";
import { Rail } from "../rail";
import { Tile } from "../tile";

export interface ExcludedItemProps {
  source: Source;
  reason: ExcludeReason;
  pinned: boolean;
  /**
   * Its place in its section, for the group's rounded ends.
   * @platform android
   */
  index?: number;
  /** @platform android */
  count?: number;
  mangaKey: string;
  actions: SourceActions;
  /** iOS: See error shows the message in the sheet's dialog. */
  onError?: (row: ErrorRequest) => void;
}

export const ExcludedItem = memo(function ExcludedItem({
  source,
  reason,
  pinned,
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
  // Stop and Include are buttons on the row here.
  const items = excludedRowMenu({
    source,
    url,
    searching,
    scanning,
    error,
    actions,
    withStop: false,
    withInclude: false,
  });
  return (
    <View>
      <ContextMenu items={items}>
        <Frame.Row>
          <Frame.Media>
            <Tile source={source} loading={scanning} />
          </Frame.Media>
          <Frame.Content>
            <Frame.Title as="p">{source.baseName ?? source.name}</Frame.Title>
            <Frame.Description>
              {source.lang && <Badge>{source.lang.toUpperCase()}</Badge>}{" "}
              {scanning ? (
                <Badge>scanning…</Badge>
              ) : (
                <>
                  <Badge color={REASONS[reason].color}>
                    {REASONS[reason].badge}
                  </Badge>{" "}
                  <Badge>{excludedBy(pinned)}</Badge>
                </>
              )}
            </Frame.Description>
          </Frame.Content>
          <Frame.Actions>
            {/* While it scans, the tile shows it and this stops it. */}
            {scanning ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => actions.stop(source.id)}
                aria-label={`Stop scanning ${source.name}`}
              >
                <Icon name={Icons.close} />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => actions.include(source.id)}
                aria-label={`Include ${source.name}`}
              >
                Include
              </Button>
            )}
            {/* Last, as on Available rows. */}
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
        </Frame.Row>
      </ContextMenu>
      <Rail
        mangaKey={mangaKey}
        mangaId={Number(mangaKey)}
        source={source}
        actions={actions}
      />
    </View>
  );
});
