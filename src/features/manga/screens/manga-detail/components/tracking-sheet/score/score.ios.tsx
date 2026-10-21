import { ScrollView, VStack } from "@expo/ui/swift-ui";
import { fixedSize, padding } from "@expo/ui/swift-ui/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Rating } from "@/components/ui/rating";
import { Slider } from "@/components/ui/slider";
import { Header } from "../header.ios";
import { useScore } from "./hooks/use-score";
import type { ScoreProps } from "./score";

export function Score({ value, onCancel, onConfirm }: ScoreProps) {
  const { isLandscape } = useBreakpoint();
  const { scale, score, change } = useScore(value);
  const RatingOrSlider = scale.max > 10 ? Slider : Rating;

  return (
    <VStack
      alignment="leading"
      spacing={0}
      modifiers={[padding({ vertical: 16 })]}
    >
      <Header
        title="Score"
        subtitle={`${score || "_"}/${scale.max}`}
        onCancel={onCancel}
        onConfirm={() => onConfirm(score)}
        canConfirm={score !== value}
      />

      <ScrollView
        modifiers={isLandscape ? [] : [fixedSize({ vertical: true })]}
      >
        <VStack modifiers={[padding({ all: 16 })]}>
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
        </VStack>
      </ScrollView>
    </VStack>
  );
}
