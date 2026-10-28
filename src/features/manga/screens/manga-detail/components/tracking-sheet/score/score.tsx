import { Typography } from "panelui-native/components/typography";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { ScrollView, View } from "react-native";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Rating } from "@/components/ui/rating";
import { Slider } from "@/components/ui/slider";
import { Footer } from "../footer";
import { useScore } from "./hooks/use-score";

export interface ScoreProps {
  value: number;
  onCancel: () => void;
  onConfirm: (score: number) => void;
}

/** The viewer's own score format decides the control: stars, or a long scale. */
export function Score({ value, onCancel, onConfirm }: ScoreProps) {
  const { isLandscape } = useBreakpoint();
  const { scale, score, change } = useScore(value);
  const RatingOrSlider = scale.max > 10 ? Slider : Rating;

  return (
    <View className="py-4">
      <View className="flex-row items-center gap-2 px-4">
        <Typography type="h4" numberOfLines={1}>
          Score
        </Typography>
        <View className="flex-1" />
        <Typography.Code>{`${score || "_"}/${scale.max}`}</Typography.Code>
      </View>

      <ScrollView className={cn("w-full", isLandscape && "min-h-0 flex-1")}>
        <View className="items-center p-4">
          {/* Dragging the control must not drag the sheet out from under it. */}
          <BottomSheet.LockDrag>
            <RatingOrSlider
              value={score}
              min={0}
              max={scale.max}
              step={scale.step}
              precision={scale.step}
              onValueChange={change}
              accessibilityLabel="Score"
            />
          </BottomSheet.LockDrag>
        </View>
      </ScrollView>

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(score)}
        canConfirm={score !== value}
      />
    </View>
  );
}
