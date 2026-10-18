import { Column, Row } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Code, Text } from "@/components/native/jetpack-compose/text";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Rating } from "@/components/ui/rating";
import { Slider } from "@/components/ui/slider";
import { Footer } from "../footer";
import type { ScoreProps } from "./score";
import { useScore } from "./use-score";

export function Score({ value, onCancel, onConfirm }: ScoreProps) {
  const { isLandscape } = useBreakpoint();
  const { scale, score, change } = useScore(value);
  const RatingOrSlider = scale.max > 10 ? Slider : Rating;

  return (
    <Column modifiers={[padding(0, 0, 0, 16)]}>
      <Row
        verticalAlignment="center"
        horizontalArrangement={{ spacedBy: 8 }}
        modifiers={[padding(16, 0, 16, 0)]}
      >
        <Text
          style={{ typography: "titleLarge" }}
          maxLines={1}
          overflow="ellipsis"
          modifiers={[weight(1)]}
        >
          Score
        </Text>
        <Code>{`${score || "_"}/${scale.max}`}</Code>
      </Row>

      <Column
        horizontalAlignment="center"
        modifiers={[
          fillMaxWidth(),
          ...(isLandscape ? [weight(1)] : []),
          verticalScroll(),
          padding(16, 16, 16, 16),
        ]}
      >
        <BottomSheet.LockDrag>
          <RatingOrSlider
            value={score}
            min={0}
            max={scale.max}
            step={scale.step}
            precision={scale.step}
            onValueChange={change}
          />
        </BottomSheet.LockDrag>
      </Column>

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(score)}
        canConfirm={score !== value}
      />
    </Column>
  );
}
