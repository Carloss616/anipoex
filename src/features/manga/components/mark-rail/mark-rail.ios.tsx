import { HStack, ZStack } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  foregroundStyle,
  offset,
  opacity,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { SourceTile } from "@/features/manga/components/source-tile";
import type { ActiveMark } from "@/features/manga/state/active-scans";
import { sourceColor } from "@/features/manga/utils/source";
import { themeMode$ } from "@/state/theme";
import type { MarkRailProps } from "./mark-rail";
import { DIM, markLabel, SHOWN } from "./utils";

export function MarkRail({ marks }: MarkRailProps) {
  const more = marks.length - SHOWN;
  return (
    // Room for the badges that hang below the tiles.
    <HStack spacing={6} modifiers={[padding({ bottom: 4 })]}>
      {marks.slice(0, SHOWN).map((mark) => (
        <MarkTile key={mark.id} mark={mark} />
      ))}
      {more > 0 && (
        <Text
          textStyle="subheadline"
          modifiers={[foregroundStyle("secondary")]}
        >
          {`+${more}`}
        </Text>
      )}
    </HStack>
  );
}

const MarkTile = memo(function MarkTile({ mark }: { mark: ActiveMark }) {
  const mode = useValue(themeMode$);
  const { state, unread } = mark;
  return (
    <ZStack
      alignment="bottomTrailing"
      modifiers={[
        accessibilityLabel(markLabel(mark)),
        ...(DIM.has(state) ? [opacity(0.4)] : []),
      ]}
    >
      <SourceTile
        initials={mark.initials}
        iconUrl={mark.iconUrl}
        color={sourceColor(mark, mode)}
        loading={state === "scanning"}
      />
      {state === "found" && !!unread && (
        <ZStack modifiers={[offset({ x: 4, y: 4 })]}>
          <Badge color="success">{`+${unread}`}</Badge>
        </ZStack>
      )}
      {state === "error" && (
        <ZStack modifiers={[offset({ x: 2, y: 2 })]}>
          <Badge color="destructive" />
        </ZStack>
      )}
    </ZStack>
  );
});
