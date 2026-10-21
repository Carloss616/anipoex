import {
  Button,
  ContextMenu,
  HStack,
  Label,
  Menu,
  Spacer,
  SwipeActions,
  VStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  accessibilityHidden,
  buttonStyle,
  contentShape,
  disabled,
  foregroundStyle,
  frame,
  lineLimit,
  shapes,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { Computed } from "@legendapp/state/react";
import { memo } from "react";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { isScanBusy } from "@/features/manga/state/probes";
import { FAR_BEHIND_GAP, REASONS } from "@/features/manga/utils/msu";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useSourceScan } from "../hooks/use-source-scan";
import { Tile } from "../tile";
import { excludeReasons, statusDetail } from "../utils/row-content";
import { sourceStatus } from "../utils/source-status";
import type { AvailableItemProps } from "./available-item";

// The whole row takes the tap, long-press and swipe, not just its text.
const FILL = [
  frame({ maxWidth: Infinity, alignment: "leading" }),
  contentShape(shapes.rectangle()),
];

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
}: AvailableItemProps) {
  const [primary, destructive] = useThemeColor(["primary", "destructive"]);
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
  const rescan = (
    <Computed>
      {() => (
        <Button
          label="Rescan"
          systemImage="arrow.clockwise"
          modifiers={[disabled(isScanBusy(mangaKey))]}
          onPress={() => actions.rescan(source.id)}
        />
      )}
    </Computed>
  );

  return (
    <SwipeActions>
      <ContextMenu>
        <ContextMenu.Items>
          {rescan}
          {/* The selected source can't be excluded. */}
          {!selected && (
            <Menu label="Exclude" systemImage="eye.slash">
              {excludeReasons(suspicious).map((reason) => (
                <Button
                  key={reason}
                  label={REASONS[reason].menu}
                  role="destructive"
                  onPress={() => actions.exclude(source.id, reason)}
                />
              ))}
            </Menu>
          )}
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <Button
            onPress={() => onSelect(source.id)}
            modifiers={[
              buttonStyle("plain"),
              accessibilityAddTraits(selected ? ["isSelected"] : []),
            ]}
          >
            {/* A plain button only takes touches on its label, so the label fills the row. */}
            <HStack modifiers={FILL}>
              <Label icon={<Tile source={source} />}>
                <VStack alignment="leading" spacing={2}>
                  <Text weight="medium" modifiers={[lineLimit(1)]}>
                    {source.name}
                  </Text>
                  <HStack spacing={6}>
                    {scanning ? (
                      <Badge>scanning…</Badge>
                    ) : (
                      <Badge color={status.color}>{status.label}</Badge>
                    )}
                    {detail !== "" && (
                      <Text
                        textStyle="subheadline"
                        modifiers={[foregroundStyle("secondary"), lineLimit(1)]}
                      >
                        {detail}
                      </Text>
                    )}
                  </HStack>
                </VStack>
              </Label>
              <Spacer />
              {/* A fixed slot, so the name and badge never shift; hidden, as the row already reads its trait and `scanning…`. */}
              <HStack
                modifiers={[
                  frame({ width: BUTTON_ICON_SIZE }),
                  accessibilityHidden(true),
                ]}
              >
                {scanning ? (
                  <Loader size="sm" />
                ) : selected ? (
                  <Icon
                    name={Icons.check}
                    size={BUTTON_ICON_SIZE}
                    color={primary}
                  />
                ) : null}
              </HStack>
            </HStack>
          </Button>
        </ContextMenu.Trigger>
      </ContextMenu>
      {/* No full swipe: a long drag shouldn't start a scan. */}
      <SwipeActions.Actions allowsFullSwipe={false}>
        {rescan}
        {!selected && (
          <Button
            label="Exclude"
            systemImage="eye.slash"
            // No destructive role: SwiftUI would delete the row before a reason is picked.
            modifiers={[tint(destructive)]}
            onPress={() => onExclude?.({ source, suspicious })}
          />
        )}
      </SwipeActions.Actions>
    </SwipeActions>
  );
});
