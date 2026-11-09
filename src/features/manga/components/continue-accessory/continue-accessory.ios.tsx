import { Button, HStack, Spacer, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  foregroundStyle,
  frame,
  lineLimit,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { router } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { Host } from "@/components/ui/host";
import { Icon, Icons } from "@/components/ui/icon";
import { continueReading$ } from "@/features/manga/state/continue-reading";
import {
  CONTINUE_LABEL,
  chapterBadge,
} from "@/features/manga/utils/continue-label";
import { sourceColor } from "@/features/manga/utils/source";
import { themeMode$ } from "@/state/theme";
import { SourceTile } from "../source-tile";

/** The system renders it twice (regular and inline), so it keeps no state. */
export function ContinueAccessory() {
  const next = useValue(continueReading$);
  const mode = useValue(themeMode$);
  const inline = NativeTabs.BottomAccessory.usePlacement() === "inline";
  if (!next) return null;
  const label = CONTINUE_LABEL[next.started ? "continue" : "start"];
  const badge = chapterBadge(next.number);

  return (
    <Host className="flex-1">
      <Button
        onPress={() =>
          router.push({
            pathname: "/manga/[id]/reader",
            params: { id: next.mangaId, chapter: next.chapterId },
          })
        }
        modifiers={[buttonStyle("plain")]}
      >
        <HStack
          spacing={10}
          alignment="center"
          modifiers={[
            padding({ horizontal: 16 }),
            frame({ maxWidth: Infinity, maxHeight: Infinity }),
          ]}
        >
          <Icon name={Icons.play} color="inherit" />
          {next.source && (
            <SourceTile
              initials={next.source.initials}
              iconUrl={next.source.iconUrl}
              color={sourceColor(next.source, mode)}
            />
          )}
          <VStack alignment="leading" spacing={1}>
            <HStack spacing={6}>
              <Text weight="semibold">{label}</Text>
            </HStack>
            {!inline && next.source && (
              <Text
                textStyle="caption"
                modifiers={[foregroundStyle("secondary"), lineLimit(1)]}
              >
                {next.source.name}
              </Text>
            )}
          </VStack>
          <Spacer />
          {badge && <Badge>{badge}</Badge>}
        </HStack>
      </Button>
    </Host>
  );
}
