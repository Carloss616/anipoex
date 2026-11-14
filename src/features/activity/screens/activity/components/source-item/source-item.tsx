import { useValue } from "@legendapp/state/react";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { SourceTile } from "@/features/manga/components/source-tile";
import { activeScans$ } from "@/features/manga/state/active-scans";
import { sourceColor } from "@/features/manga/utils/source";
import { themeMode$ } from "@/state/theme";
import { stopSource } from "../../utils/actions";
import { isBusy, sourceStatus } from "../../utils/progress";
import { sourceMenu } from "../../utils/row-menu";

export interface SourceItemProps {
  mangaId: string;
  sourceId: string;
  /**
   * Its place among the manga's sources, for its corners.
   * @platform android
   */
  index?: number;
  /** @platform android */
  count?: number;
}

/** One source of a running manga, with its state; Stop while it reads. */
export const SourceItem = memo(function SourceItem({
  mangaId,
  sourceId,
}: SourceItemProps) {
  const mark = useValue(activeScans$[mangaId].marks[sourceId]);
  const mode = useValue(themeMode$);
  if (!mark) return null;
  const busy = isBusy(mark);
  const status = sourceStatus(mark);
  const row = (
    <Frame.Row className={busy ? "ps-8 pe-17" : "ps-8"}>
      <Frame.Media>
        <SourceTile
          initials={mark.initials}
          iconUrl={mark.iconUrl}
          color={sourceColor(mark, mode)}
          loading={mark.state === "scanning"}
        />
      </Frame.Media>
      <Frame.Content>
        <Frame.Title as="p" className="font-normal">
          {mark.name}
        </Frame.Title>
      </Frame.Content>
      <Badge
        color={status.tone === "muted" ? undefined : status.tone}
        className="shrink-0"
      >
        {status.label}
      </Badge>
    </Frame.Row>
  );

  return (
    <View>
      {busy ? (
        <ContextMenu items={sourceMenu(Number(mangaId), sourceId)}>
          {row}
        </ContextMenu>
      ) : (
        row
      )}
      {busy && (
        <Frame.Actions className="absolute inset-y-0 inset-e-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => stopSource(Number(mangaId), sourceId)}
            aria-label={`Stop ${mark.name}`}
          >
            <Icon name={Icons.stop} className="text-destructive" />
          </Button>
        </Frame.Actions>
      )}
    </View>
  );
});
