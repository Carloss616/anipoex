import {
  Button,
  HStack,
  Label,
  Spacer,
  SwipeActions,
  VStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  accessibilityHidden,
  buttonStyle,
  foregroundStyle,
  frame,
  lineLimit,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { RNHostView } from "@/components/ui/host";
import { Icon, Icons, sfSymbol } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { challenged$ } from "@/features/manga/state/challenged";
import { FAR_BEHIND_GAP } from "@/features/manga/utils/msu";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useMatchUrl } from "../../hooks/use-match-url";
import { useSearching } from "../../hooks/use-searching";
import { useSourceScan } from "../../hooks/use-source-scan";
import { searchItem, statusDetail } from "../../utils/row-content";
import { availableRowMenu } from "../../utils/row-menu";
import { sourceStatus } from "../../utils/source-status";
import { CloudflareLogo } from "../cloudflare-logo";
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
  actions,
  onSelect,
  onExclude,
  onError,
}: AvailableItemProps) {
  const [primary, destructive] = useThemeColor(["primary", "destructive"]);
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
  const searchIcon = searching ? Icons.searchTitlesOff : Icons.searchTitles;
  const search = searchItem(source, searching, actions);
  const url = useMatchUrl(mangaKey, source.id);
  // While this source scans, it stops it: a slow one can scan for minutes.
  const rescan = (
    <Button
      label={scanning ? "Stop" : "Rescan"}
      systemImage={sfSymbol(scanning ? Icons.close : Icons.refresh)}
      onPress={() =>
        scanning ? actions.stop(source.id) : actions.rescan(source.id)
      }
    />
  );
  // The swipe's buttons are narrow: there it's just "Website".
  const website = (label: string) =>
    (url || source.homeUrl) && (
      <Button
        label={label}
        systemImage={sfSymbol(Icons.website)}
        onPress={() => actions.openWebsite(source, url)}
      />
    );

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
    onSeeError: error ? () => onError?.({ source, error }) : undefined,
  });

  return (
    <SwipeActions>
      <VStack alignment="leading" spacing={10}>
        <ContextMenu items={menu}>
          <Button
            onPress={() => onSelect(source.id)}
            modifiers={[
              buttonStyle("plain"),
              accessibilityAddTraits(selected ? ["isSelected"] : []),
            ]}
          >
            {/* A plain button only takes touches on its label: the label fills the row. */}
            <HStack modifiers={ROW_FILL}>
              <Label icon={<Tile source={source} loading={scanning} />}>
                <VStack alignment="leading" spacing={2}>
                  <Text weight="medium" modifiers={[lineLimit(1)]}>
                    {source.baseName ?? source.name}
                  </Text>
                  <HStack spacing={6}>
                    {source.lang && <Badge>{source.lang.toUpperCase()}</Badge>}
                    {challenged && (
                      <RNHostView matchContents>
                        <CloudflareLogo />
                      </RNHostView>
                    )}
                    {scanning ? (
                      <Badge>scanning…</Badge>
                    ) : (
                      <Badge color={status.color}>{status.label}</Badge>
                    )}
                    {detail.chapter && <Badge>{detail.chapter}</Badge>}
                    {detail.age && (
                      <Text
                        textStyle="subheadline"
                        modifiers={[foregroundStyle("secondary"), lineLimit(1)]}
                      >
                        {detail.age}
                      </Text>
                    )}
                  </HStack>
                </VStack>
              </Label>
              <Spacer />
              {/* A fixed slot so the name never shifts; hidden, as the row reads its trait. */}
              <HStack
                modifiers={[frame({ width: 18 }), accessibilityHidden(true)]}
              >
                {selected ? <Icon name={Icons.check} color={primary} /> : null}
              </HStack>
            </HStack>
          </Button>
        </ContextMenu>
        <Rail
          mangaKey={mangaKey}
          mangaId={Number(mangaKey)}
          source={source}
          actions={actions}
        />
      </VStack>
      {/* Right edge: search, rescan and website. No full swipe on either
          edge: a long drag shouldn't start one. */}
      <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
        <Button
          label={searching ? "Stop" : "Search"}
          systemImage={sfSymbol(searchIcon)}
          modifiers={[tint(primary)]}
          onPress={search.onPress}
        />
        {rescan}
        {website("Website")}
      </SwipeActions.Actions>
      <SwipeActions.Actions edge="leading" allowsFullSwipe={false}>
        <Button
          label="Exclude"
          systemImage={sfSymbol(Icons.exclude)}
          // No destructive role: SwiftUI would delete the row before a reason
          // is picked.
          modifiers={[tint(destructive)]}
          onPress={() => onExclude?.({ source, suspicious })}
        />
      </SwipeActions.Actions>
    </SwipeActions>
  );
});
