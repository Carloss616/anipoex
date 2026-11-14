import { Computed, useValue } from "@legendapp/state/react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { View } from "react-native";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { Progress } from "@/components/ui/progress";
import { activeScans$ } from "@/features/manga/state/active-scans";
import { stopManga } from "../../utils/actions";
import { scanProgress } from "../../utils/progress";
import { runningMenu } from "../../utils/row-menu";
import { expanded$, split, toggleExpanded } from "../../utils/state";
import { SourceItem } from "../source-item";

export interface RunningItemProps {
  mangaId: string;
}

/** A manga being scanned; a tap shows its sources under it. */
export const RunningItem = memo(function RunningItem({
  mangaId,
}: RunningItemProps) {
  const scan$ = activeScans$[mangaId];
  const name = useValue(scan$.name);
  const cover = useValue(scan$.cover);
  const expanded = useValue(() => !!expanded$[mangaId].get());
  const id = Number(mangaId);
  const open = () => router.navigate(`/manga/${id}`);

  return (
    <View>
      <View>
        <ContextMenu items={runningMenu(id, { expanded, open })}>
          <Frame.Row
            onClick={() => toggleExpanded(id)}
            aria-expanded={expanded}
            className="pe-27"
          >
            <Frame.Media>
              <Image
                source={cover}
                contentFit="cover"
                style={{ width: 34, height: 48, borderRadius: 6 }}
              />
            </Frame.Media>
            <Frame.Content>
              <Frame.Title as="p">{name}</Frame.Title>
              <Computed>
                {() => {
                  const marks = Object.values(scan$.marks.get() ?? {});
                  const { value, line } = scanProgress(marks);
                  return (
                    <Progress
                      label={line}
                      value={value}
                      maxValue={1}
                      size="sm"
                    />
                  );
                }}
              </Computed>
            </Frame.Content>
          </Frame.Row>
        </ContextMenu>
        <Frame.Actions className="absolute inset-y-0 inset-e-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={open}
            aria-label={`Open ${name}`}
          >
            <Icon name={Icons.openExternal} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => stopManga(id)}
            aria-label={`Stop scanning ${name}`}
          >
            <Icon name={Icons.stop} className="text-destructive" />
          </Button>
        </Frame.Actions>
      </View>
      {expanded && <SourceList mangaId={mangaId} />}
    </View>
  );
});

function SourceList({ mangaId }: RunningItemProps) {
  const ids = useValue(() =>
    Object.keys(activeScans$[mangaId].marks.get(true) ?? {}).join(),
  );

  return (
    <View className="bg-muted/40">
      {split(ids).map((sourceId) => (
        <SourceItem key={sourceId} mangaId={mangaId} sourceId={sourceId} />
      ))}
    </View>
  );
}
