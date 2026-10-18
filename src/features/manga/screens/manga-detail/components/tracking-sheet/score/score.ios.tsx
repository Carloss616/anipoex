import { HStack, ScrollView, Spacer, VStack } from "@expo/ui/swift-ui";
import { fixedSize, lineLimit, padding } from "@expo/ui/swift-ui/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Code, Text } from "@/components/native/swift-ui/text";
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
    <VStack
      alignment="leading"
      spacing={0}
      modifiers={[padding({ vertical: 16 })]}
    >
      <HStack spacing={8} modifiers={[padding({ horizontal: 16 })]}>
        <Text textStyle="title3" modifiers={[lineLimit(1)]}>
          Score
        </Text>
        <Spacer />
        <Code>{`${score || "_"}/${scale.max}`}</Code>
      </HStack>

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

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(score)}
        canConfirm={score !== value}
      />
    </VStack>
  );
}
