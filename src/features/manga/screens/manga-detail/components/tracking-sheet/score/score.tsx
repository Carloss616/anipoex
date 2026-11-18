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

/** The viewer's score format decides the control: stars, or a long scale. */
export function Score({ value, onCancel, onConfirm }: ScoreProps) {
  const { scale, score, change } = useScore(value);

  return (
    <>
      <Sheet.Header className="p-4">
        <View className="flex-row items-center justify-between gap-2">
          <Sheet.Title>Score</Sheet.Title>
          <Typography.Code className="ms-auto">
            {score || "_"}/{scale.max}
          </Typography.Code>
        </View>
      </Sheet.Header>

      <Sheet.Body className="px-4 pb-0">
        <BottomSheet.LockDrag className="items-center">
          {scale.max > 10 ? (
            <Slider
              variant="line"
              color="primary"
              label="Score"
              value={score}
              max={scale.max}
              step={scale.step}
              onValueChange={change}
            />
          ) : (
            <Rating
              value={score}
              max={scale.max}
              precision={scale.step}
              onValueChange={change}
              accessibilityLabel="Score"
            />
          )}
        </BottomSheet.LockDrag>
      </Sheet.Body>

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(score)}
        canConfirm={score !== value}
      />
    </>
  );
}
