import {
  Button,
  DisclosureGroup,
  HStack,
  SwipeActions,
  VStack,
} from "@expo/ui/swift-ui";
import {
  clipShape,
  foregroundStyle,
  frame,
  lineLimit,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { Computed, useValue } from "@legendapp/state/react";
import { router } from "expo-router";
import { memo } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { Icons, sfSymbol } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { Progress } from "@/components/ui/progress";
import { activeScans$ } from "@/features/manga/state/active-scans";
import { useThemeColor } from "@/hooks/use-theme-color";
import { stopManga } from "../../utils/actions";
import { scanProgress } from "../../utils/progress";
import { runningMenu } from "../../utils/row-menu";
import { expanded$, split } from "../../utils/state";
import { SourceItem } from "../source-item";
import type { RunningItemProps } from "./running-item";

export const RunningItem = memo(function RunningItem({
  mangaId,
}: RunningItemProps) {
  const scan$ = activeScans$[mangaId];
  const name = useValue(scan$.name) ?? "";
  const cover = useValue(scan$.cover);
  const expanded = useValue(() => !!expanded$[mangaId].get());
  const destructive = useThemeColor("destructive");
  const id = Number(mangaId);
  const open = () => router.navigate(`/manga/${id}`);

  return (
    <DisclosureGroup
      isExpanded={expanded}
      onIsExpandedChange={(open) => expanded$[mangaId].set(open)}
    >
      <DisclosureGroup.Label>
        <SwipeActions>
          <ContextMenu items={runningMenu(id, { expanded, open })}>
            <HStack spacing={12} modifiers={ROW_FILL}>
              {cover ? (
                <Image
                  source={{ uri: cover }}
                  modifiers={[
                    frame({ width: 34, height: 48 }),
                    clipShape("roundedRectangle", 5),
                  ]}
                />
              ) : null}
              <VStack alignment="leading" spacing={4}>
                <Text weight="medium" modifiers={[lineLimit(1)]}>
                  {name}
                </Text>
                <Computed>
                  {() => {
                    const marks = Object.values(scan$.marks.get() ?? {});
                    const { value, line } = scanProgress(marks);
                    return (
                      <VStack alignment="leading" spacing={4}>
                        <Progress value={value} maxValue={1} size="sm" />
                        <Text
                          textStyle="subheadline"
                          modifiers={[foregroundStyle("secondary")]}
                        >
                          {line}
                        </Text>
                      </VStack>
                    );
                  }}
                </Computed>
              </VStack>
            </HStack>
          </ContextMenu>
          <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
            <Button
              label="Stop"
              systemImage={sfSymbol(Icons.stop)}
              modifiers={[tint(destructive)]}
              onPress={() => stopManga(id)}
            />
          </SwipeActions.Actions>
        </SwipeActions>
      </DisclosureGroup.Label>
      {expanded && <SourceRows mangaId={mangaId} />}
    </DisclosureGroup>
  );
});

function SourceRows({ mangaId }: RunningItemProps) {
  const ids = useValue(() =>
    Object.keys(activeScans$[mangaId].marks.get(true) ?? {}).join(),
  );

  return split(ids).map((sourceId) => (
    <SourceItem key={sourceId} mangaId={mangaId} sourceId={sourceId} />
  ));
}
