import { useValue } from "@legendapp/state/react";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Menu, type MenuItem } from "@/components/ui/menu";
import { probes$, scanning$ } from "@/features/manga/state/probes";
import { type ExcludeReason, REASONS } from "@/features/manga/utils/msu";
import type { Source } from "@/features/manga/utils/source";
import type { ErrorRequest } from "../available-item";
import { useMatchUrl } from "../hooks/use-match-url";
import { useSearching } from "../hooks/use-searching";
import type { SourceActions } from "../hooks/use-source-actions";
import { Rail } from "../rail";
import { Tile } from "../tile";
import { errorDialog, excludedBadge, searchItem } from "../utils/row-content";

export interface ExcludedItemProps {
  source: Source;
  reason: ExcludeReason;
  pinned: boolean;
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
  const searchIcon = searching ? Icons.searchTitlesOff : Icons.searchTitles;
  const url = useMatchUrl(mangaKey, source.id);
  const items: MenuItem[] = [
    { ...searchItem(source, searching, actions), icon: searchIcon },
    ...(url || source.homeUrl
      ? [
          {
            label: "Open website",
            icon: Icons.website,
            onPress: () => actions.openWebsite(source, url),
          },
        ]
      : []),
    ...(error
      ? [
          {
            label: "See error",
            icon: Icons.error,
            onPressMode: "dialog" as const,
            dialogConfig: errorDialog(source.name, error, true),
            onPress: () => actions.include(source.id),
          },
        ]
      : []),
  ];
  return (
    <View>
      <Frame.Row>
        <Frame.Media>
          <Tile source={source} />
        </Frame.Media>
        <Frame.Content>
          <Frame.Title as="p">{source.baseName ?? source.name}</Frame.Title>
          <Frame.Description>
            {source.lang && <Badge>{source.lang.toUpperCase()}</Badge>}{" "}
            {scanning ? (
              <Badge>scanning…</Badge>
            ) : (
              <Badge color={REASONS[reason].color}>
                {excludedBadge(reason, pinned)}
              </Badge>
            )}
          </Frame.Description>
        </Frame.Content>
        <Frame.Actions>
          {scanning ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                loading
                aria-label={`Scanning ${source.name}`}
              >
                <Icon name={Icons.refresh} size={BUTTON_ICON_SIZE} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => actions.stop(source.id)}
                aria-label={`Stop scanning ${source.name}`}
              >
                <Icon name={Icons.close} size={BUTTON_ICON_SIZE} />
              </Button>
            </>
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
              <Icon name={Icons.more} size={BUTTON_ICON_SIZE} />
            </Button>
          </Menu>
        </Frame.Actions>
      </Frame.Row>
      <Rail
        mangaKey={mangaKey}
        mangaId={Number(mangaKey)}
        source={source}
        actions={actions}
      />
    </View>
  );
});
