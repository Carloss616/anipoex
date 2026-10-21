import {
  Button,
  ContextMenu,
  HStack,
  Label,
  Spacer,
  SwipeActions,
  VStack,
} from "@expo/ui/swift-ui";
import { disabled, lineLimit, tint } from "@expo/ui/swift-ui/modifiers";
import { Computed, useValue } from "@legendapp/state/react";
import { memo } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { isScanBusy, probes$ } from "@/features/manga/state/probes";
import { REASONS } from "@/features/manga/utils/msu";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Tile } from "../tile";
import { excludedBadge } from "../utils/row-content";
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
  const error = useValue(() => probes$[mangaKey][source.id].error.get());
  const include = (color?: string) => (
    <Computed>
      {() => (
        <Button
          label="Include"
          systemImage="arrow.uturn.backward"
          modifiers={[
            ...(color ? [tint(color)] : []),
            disabled(isScanBusy(mangaKey)),
          ]}
          onPress={() => actions.include(source.id)}
        />
      )}
    </Computed>
  );

  return (
    <SwipeActions>
      <ContextMenu>
        <ContextMenu.Items>
          {include()}
          {error && (
            <Button
              label="See error"
              systemImage="exclamationmark.triangle"
              onPress={() => onError?.({ source, error, excluded: true })}
            />
          )}
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <HStack modifiers={ROW_FILL}>
            <Label icon={<Tile source={source} />}>
              <VStack alignment="leading" spacing={2}>
                <Text weight="medium" modifiers={[lineLimit(1)]}>
                  {source.baseName ?? source.name}
                </Text>
                <HStack spacing={6}>
                  {source.lang && <Badge>{source.lang.toUpperCase()}</Badge>}
                  <Badge color={REASONS[reason].color}>
                    {excludedBadge(reason, pinned)}
                  </Badge>
                </HStack>
              </VStack>
            </Label>
            <Spacer />
          </HStack>
        </ContextMenu.Trigger>
      </ContextMenu>
      {/* Both edges: a left swipe works here as on Available rows. */}
      {(["leading", "trailing"] as const).map((edge) => (
        <SwipeActions.Actions key={edge} edge={edge}>
          {include(primary)}
        </SwipeActions.Actions>
      ))}
    </SwipeActions>
  );
});
