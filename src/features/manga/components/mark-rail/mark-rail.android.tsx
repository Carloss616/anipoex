import { Box, Row } from "@expo/ui/jetpack-compose";
import {
  alpha,
  offset,
  padding,
  semantics,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { SourceTile } from "@/features/manga/components/source-tile";
import type { ActiveMark } from "@/features/manga/state/active-scans";
import { sourceColor } from "@/features/manga/utils/source";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { themeMode$ } from "@/state/theme";
import type { MarkRailProps } from "./mark-rail";
import { DIM, markLabel, SHOWN } from "./utils";

export function MarkRail({ marks }: MarkRailProps) {
  const m3 = useThemeM3Colors();
  const more = marks.length - SHOWN;
  return (
    <Row
      horizontalArrangement={{ spacedBy: 6 }}
      verticalAlignment="center"
      // Room for the badges that hang below the tiles.
      modifiers={[padding(0, 0, 0, 4)]}
    >
      {marks.slice(0, SHOWN).map((mark) => (
        <MarkTile key={mark.id} mark={mark} />
      ))}
      {more > 0 && (
        <Text style={{ typography: "labelLarge" }} color={m3.onSurfaceVariant}>
          {`+${more}`}
        </Text>
      )}
    </Row>
  );
}

const MarkTile = memo(function MarkTile({ mark }: { mark: ActiveMark }) {
  const mode = useValue(themeMode$);
  const { state, unread } = mark;
  return (
    <Box
      contentAlignment="bottomEnd"
      modifiers={[
        semantics({ contentDescription: markLabel(mark) }),
        ...(DIM.has(state) ? [alpha(0.4)] : []),
      ]}
    >
      <SourceTile
        initials={mark.initials}
        iconUrl={mark.iconUrl}
        color={sourceColor(mark, mode)}
        loading={state === "scanning"}
      />
      {state === "found" && !!unread && (
        <Box modifiers={[offset(4, 4)]}>
          <Badge color="success">{`+${unread}`}</Badge>
        </Box>
      )}
      {state === "error" && (
        <Box modifiers={[offset(2, 2)]}>
          <Badge color="destructive" />
        </Box>
      )}
    </Box>
  );
});
