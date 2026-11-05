import {
  Button,
  HStack,
  Label,
  Spacer,
  SwipeActions,
  VStack,
} from "@expo/ui/swift-ui";
import { lineLimit, tint } from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { Icons, sfSymbol } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { probes$, scanning$ } from "@/features/manga/state/probes";
import { REASONS } from "@/features/manga/utils/msu";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useMatchUrl } from "../hooks/use-match-url";
import { useSearching } from "../hooks/use-searching";
import { Rail } from "../rail";
import { Tile } from "../tile";
import { excludedBadge, searchItem } from "../utils/row-content";
import { excludedRowMenu } from "../utils/row-menu";
import type { ExcludedItemProps } from "./excluded-item";

export const ExcludedItem = memo(function ExcludedItem({
  source,
  reason,
  pinned,
  mangaKey,
  actions,
  onError,
}: ExcludedItemProps) {
  const primary = useThemeColor("primary");
  // Rechecked or picked by hand, it stays here until its probe judges it.
  const scanning = useValue(
    () => scanning$[mangaKey][source.id].get() === true,
  );
  const lastError = useValue(() => probes$[mangaKey][source.id].error.get());
  // The last read's failure, hidden while the source is read again.
  const error = scanning ? undefined : lastError;
  const searching = useSearching(mangaKey, source.id);
  const searchIcon = searching ? Icons.searchTitlesOff : Icons.searchTitles;
  const search = searchItem(source, searching, actions);
  const url = useMatchUrl(mangaKey, source.id);
  // The swipe's buttons are narrow: there it's just "Website".
  const website = (label: string) =>
    (url || source.homeUrl) && (
      <Button
        label={label}
        systemImage={sfSymbol(Icons.website)}
        onPress={() => actions.openWebsite(source, url)}
      />
    );
  // While this source scans, Include gives way to Stop, as Rescan does on
  // Available rows.
  const include = (color?: string) => (
    <Button
      label={scanning ? "Stop" : "Include"}
      systemImage={scanning ? sfSymbol(Icons.close) : "arrow.uturn.backward"}
      modifiers={color ? [tint(color)] : []}
      onPress={() =>
        scanning ? actions.stop(source.id) : actions.include(source.id)
      }
    />
  );

  const menu = excludedRowMenu({
    source,
    url,
    searching,
    scanning,
    error,
    actions,
    withStop: true,
    withInclude: true,
    onSeeError: error
      ? () => onError?.({ source, error, excluded: true })
      : undefined,
  });

  return (
    <SwipeActions>
      <VStack alignment="leading" spacing={10}>
        <ContextMenu items={menu}>
          <HStack modifiers={ROW_FILL}>
            <Label icon={<Tile source={source} loading={scanning} />}>
              <VStack alignment="leading" spacing={2}>
                <Text weight="medium" modifiers={[lineLimit(1)]}>
                  {source.baseName ?? source.name}
                </Text>
                <HStack spacing={6}>
                  {source.lang && <Badge>{source.lang.toUpperCase()}</Badge>}
                  {scanning ? (
                    <Badge>scanning…</Badge>
                  ) : (
                    <Badge color={REASONS[reason].color}>
                      {excludedBadge(reason, pinned)}
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </Label>
            <Spacer />
          </HStack>
        </ContextMenu>
        <Rail
          mangaKey={mangaKey}
          mangaId={Number(mangaKey)}
          source={source}
          actions={actions}
        />
      </VStack>
      {/* Right edge only: search, include and website, where Available rows
          search. */}
      <SwipeActions.Actions edge="trailing">
        <Button
          label={searching ? "Stop" : "Search"}
          systemImage={sfSymbol(searchIcon)}
          modifiers={[tint(primary)]}
          onPress={search.onPress}
        />
        {include(primary)}
        {website("Website")}
      </SwipeActions.Actions>
    </SwipeActions>
  );
});
