import { Box, TextButton } from "@expo/ui/jetpack-compose";
import { padding } from "@expo/ui/jetpack-compose/modifiers";
import { Computed } from "@legendapp/state/react";
import { GUTTER } from "@/components/native/constants";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon } from "@/components/ui/icon";
import { waitingIds } from "@/features/activity/utils/state";
import { resumeDownloads } from "@/features/downloads";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { Overview } from "../overview";
import { COPY } from "./constants";
import type { StatusCardProps } from "./status-card";
import { sendingLine } from "./utils";

export function StatusCard({ mode }: StatusCardProps) {
  const m3 = useThemeM3Colors();

  if (mode === "reading" || mode === "scans") return <Overview />;

  const { icon, title } = COPY[mode];

  return (
    <Box modifiers={[padding(GUTTER, 0, GUTTER, 0)]}>
      <SegmentedListItem
        index={0}
        count={1}
        colors={{ containerColor: m3.surfaceContainerHigh }}
      >
        <SegmentedListItem.Leading>
          <Icon name={icon} color="inherit" />
        </SegmentedListItem.Leading>
        <Text>{title}</Text>
        <SegmentedListItem.Supporting>
          {mode === "sending" ? (
            <Computed>
              {() => (
                <Text style={{ typography: "bodyMedium" }}>
                  {sendingLine(waitingIds())}
                </Text>
              )}
            </Computed>
          ) : (
            <Text style={{ typography: "bodyMedium" }}>
              {COPY[mode].description}
            </Text>
          )}
        </SegmentedListItem.Supporting>
        {mode === "paused" && (
          <SegmentedListItem.Trailing>
            <TextButton onClick={resumeDownloads}>
              <Text style={{ typography: "labelLarge" }}>Resume</Text>
            </TextButton>
          </SegmentedListItem.Trailing>
        )}
      </SegmentedListItem>
    </Box>
  );
}
