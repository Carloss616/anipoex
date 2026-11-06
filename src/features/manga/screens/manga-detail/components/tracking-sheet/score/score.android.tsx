import { Column } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Text } from "@/components/native/jetpack-compose/text";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Rating } from "@/components/ui/rating";
import { Slider } from "@/components/ui/slider";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { Footer } from "../footer";
import { useScore } from "./hooks/use-score";
import type { ScoreProps } from "./score";

export function Score({ value, onCancel, onConfirm }: ScoreProps) {
  const { isLandscape } = useBreakpoint();
  const m3 = useThemeM3Colors();
  const { scale, score, change } = useScore(value);
  const RatingOrSlider = scale.max > 10 ? Slider : Rating;

  return (
    <Column modifiers={[padding(0, 0, 0, 16)]}>
      <Text
        style={{ typography: "titleLarge" }}
        maxLines={1}
        overflow="ellipsis"
        modifiers={[padding(16, 0, 16, 0)]}
      >
        Score
      </Text>

      <Column
        horizontalAlignment="center"
        verticalArrangement={{ spacedBy: 4 }}
        modifiers={[
          fillMaxWidth(),
          ...(isLandscape ? [weight(1)] : []),
          verticalScroll(),
          padding(16, 16, 16, 16),
        ]}
      >
        <Text style={{ typography: "displayLarge" }}>{score || "–"}</Text>
        <Text style={{ typography: "bodyMedium" }} color={m3.onSurfaceVariant}>
          out of {scale.max}
        </Text>
        <BottomSheet.LockDrag>
          <RatingOrSlider
            value={score}
            min={0}
            max={scale.max}
            // No step: a 100 scale drew 99 stop dots; useScore rounds anyway.
            precision={scale.step}
            onValueChange={change}
          />
        </BottomSheet.LockDrag>
      </Column>

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(score)}
        canConfirm={score !== value}
        onRemove={() => onConfirm(0)}
        canRemove={value > 0}
      />
    </Column>
  );
}
