import { Button, HStack, Spacer, SwipeActions } from "@expo/ui/swift-ui";
import { foregroundStyle, lineLimit, tint } from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Icons, sfSymbol } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { SourceTile } from "@/features/manga/components/source-tile";
import { activeScans$ } from "@/features/manga/state/active-scans";
import { sourceColor } from "@/features/manga/utils/source";
import { useThemeColor } from "@/hooks/use-theme-color";
import { themeMode$ } from "@/state/theme";
import { stopSource } from "../../utils/actions";
import { isBusy, sourceStatus } from "../../utils/progress";
import { sourceMenu } from "../../utils/row-menu";
import type { SourceItemProps } from "./source-item";

export const SourceItem = memo(function SourceItem({
  mangaId,
  sourceId,
}: SourceItemProps) {
  const mark = useValue(activeScans$[mangaId].marks[sourceId]);
  const mode = useValue(themeMode$);
  const [success, warning, destructive] = useThemeColor([
    "success",
    "warning",
    "destructive",
  ]);
  if (!mark) return null;
  const status = sourceStatus(mark);
  const tone = { success, warning, destructive, muted: "secondary" }[
    status.tone
  ];
  const row = (
    <HStack spacing={12} modifiers={ROW_FILL}>
      <SourceTile
        initials={mark.initials}
        iconUrl={mark.iconUrl}
        color={sourceColor(mark, mode)}
        loading={mark.state === "scanning"}
      />
      <Text modifiers={[lineLimit(1)]}>{mark.name}</Text>
      <Spacer />
      <Text textStyle="subheadline" modifiers={[foregroundStyle(tone)]}>
        {status.label}
      </Text>
    </HStack>
  );
  if (!isBusy(mark)) return row;

  return (
    <SwipeActions>
      <ContextMenu items={sourceMenu(Number(mangaId), sourceId)}>
        {row}
      </ContextMenu>
      <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
        <Button
          label="Stop"
          systemImage={sfSymbol(Icons.stop)}
          modifiers={[tint(destructive)]}
          onPress={() => stopSource(Number(mangaId), sourceId)}
        />
      </SwipeActions.Actions>
    </SwipeActions>
  );
});
