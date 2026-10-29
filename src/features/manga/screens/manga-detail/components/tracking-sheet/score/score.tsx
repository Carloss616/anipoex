import { Typography } from "panelui-native/components/typography";
import { Sheet } from "panelui-web/sheet";
import { View } from "react-native";
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
  const { scale, score, change } = useScore(value);
  const RatingOrSlider = scale.max > 10 ? Slider : Rating;

  return (
    <>
      <Sheet.Header>
        <div className="flex items-center gap-2">
          <Sheet.Title>Score</Sheet.Title>
          <Typography.Code className="ms-auto">
            {`${score || "_"}/${scale.max}`}
          </Typography.Code>
        </div>
      </Sheet.Header>

      <Sheet.Body>
        <View className="items-center">
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
      </Sheet.Body>

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(score)}
        canConfirm={score !== value}
      />
    </>
  );
}
