import { Spacer } from "@expo/ui";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Rating } from "@/components/ui/rating";
import { Slider } from "@/components/ui/slider";
import { Typography } from "@/components/ui/typography";
import { Footer } from "../footer";
import { useScore } from "./use-score";

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
    <Column className="py-4">
      <Row alignment="center" className="gap-2 px-4">
        <Typography type="h4" numberOfLines={1}>
          Score
        </Typography>
        <Spacer flexible />
        <Typography.Code>{`${score || "_"}/${scale.max}`}</Typography.Code>
      </Row>

      <ScrollView fill={isLandscape} className="w-full">
        <Column className="p-4" alignment="center">
          {/* Dragging the control must not drag the sheet out from under it. */}
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
      </ScrollView>

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(score)}
        canConfirm={score !== value}
      />
    </Column>
  );
}
