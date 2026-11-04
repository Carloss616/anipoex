import { Column, Row, Shape, Spacer, Surface } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useState } from "react";
import { Code, Text } from "@/components/native/jetpack-compose/text";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { TrackingSheet } from "../tracking-sheet";
import { useTrackingSummary } from "./hooks/use-tracking-summary";

const CARD = Shape.RoundedCorner({
  cornerRadii: { topStart: 24, topEnd: 24, bottomStart: 24, bottomEnd: 24 },
});

/** A tonal card summing the entry up, or inviting one; the sheet edits it. */
export function Tracking({ manga }: { manga: MangaDetail }) {
  const [isPresented, setIsPresented] = useState(false);
  const { tracking, label, total, progress, percent } =
    useTrackingSummary(manga);
  const m3 = useThemeM3Colors();

  return (
    <>
      <Surface
        color={m3.surfaceContainerHigh}
        shape={CARD}
        onClick={() => setIsPresented(true)}
        modifiers={[fillMaxWidth()]}
      >
        {label ? (
          <Column
            verticalArrangement={{ spacedBy: 8 }}
            modifiers={[fillMaxWidth(), padding(16, 16, 16, 16)]}
          >
            <Row
              verticalAlignment="center"
              horizontalArrangement={{ spacedBy: 8 }}
            >
              <Text>{label}</Text>
              <Spacer modifiers={[weight(1)]} />
              <Code>
                {progress}
                {!!total && `/${total}`}
              </Code>
              {!!total && (
                <Text
                  style={{ typography: "bodySmall" }}
                  color={m3.onSurfaceVariant}
                >
                  {percent}%
                </Text>
              )}
              <Icon
                name={Icons.chevronRight}
                size={BUTTON_ICON_SIZE}
                color={m3.primary}
              />
            </Row>
            {!!total && <Progress value={percent} />}
          </Column>
        ) : (
          <Row
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: 8 }}
            modifiers={[fillMaxWidth(), padding(16, 16, 16, 16)]}
          >
            <Text>Add to list</Text>
            <Spacer modifiers={[weight(1)]} />
            <Icon name={Icons.add} size={BUTTON_ICON_SIZE} color={m3.primary} />
          </Row>
        )}
      </Surface>

      <TrackingSheet
        isPresented={isPresented}
        manga={manga}
        tracking={tracking}
        onDismiss={() => setIsPresented(false)}
      />
    </>
  );
}
