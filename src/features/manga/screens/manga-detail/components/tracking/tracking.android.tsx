import { Column, OutlinedButton, Row, Spacer } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
import { useState } from "react";
import { Code, Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { TrackingSheet } from "../tracking-sheet";
import { useTrackingSummary } from "./hooks/use-tracking-summary";

/** An outlined button summing the entry up; the sheet edits it. */
export function Tracking({ manga }: { manga: MangaDetail }) {
  const [isPresented, setIsPresented] = useState(false);
  const { tracking, label, total, progress, percent } =
    useTrackingSummary(manga);
  const m3 = useThemeM3Colors();

  return (
    <>
      <OutlinedButton
        onClick={() => setIsPresented(true)}
        contentPadding={{ start: 24, top: 16, end: 24, bottom: 16 }}
        modifiers={[fillMaxWidth()]}
      >
        <Column
          verticalArrangement={{ spacedBy: 8 }}
          modifiers={[fillMaxWidth()]}
        >
          <Row
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: 8 }}
          >
            <Badge color={label ? "primary" : "secondary"} />
            {/* The status reads as text; only the chevron wears the tint. */}
            <Text color={m3.onSurface}>{label ?? "Not in list"}</Text>
            <Spacer modifiers={[weight(1)]} />
            <Code color={m3.onSurface}>
              {progress}/{total ?? "_"}
            </Code>
            {!!total && (
              <Text
                style={{ typography: "bodySmall" }}
                color={m3.onSurfaceVariant}
              >
                {percent}%
              </Text>
            )}
            <Icon name={Icons.chevronRight} size={18} color="inherit" />
          </Row>
          <Progress value={percent} />
        </Column>
      </OutlinedButton>

      <TrackingSheet
        isPresented={isPresented}
        manga={manga}
        tracking={tracking}
        onDismiss={() => setIsPresented(false)}
      />
    </>
  );
}
