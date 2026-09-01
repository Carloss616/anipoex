import { Spacer } from "@expo/ui";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useState } from "react";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { NoDragView } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { Slider } from "@/components/ui/slider";
import { Typography } from "@/components/ui/typography";
import { scoreScale } from "@/features/manga/utils/score-scale";
import { session$ } from "@/state/session";

export interface ScoreProps {
  value: number;
  onCancel: () => void;
  onConfirm: (score: number) => void;
}

/** The viewer's own score format decides the control: stars, or a long scale. */
export function Score({ value, onCancel, onConfirm }: ScoreProps) {
  const scale = scoreScale(useValue(session$.user)?.scoreFormat);
  const [score, setScore] = useState(value);

  const RatingOrSlider = scale.max > 10 ? Slider : Rating;

  const { isLandscape } = useBreakpoint();

  return (
    <Column className="py-4 android:pt-0">
      <Row alignment="center" className="gap-2 px-4">
        <Typography type="h4" numberOfLines={1}>
          Score
        </Typography>
        <Spacer flexible />
        <Typography.Code>{`${score || "_"}/${scale.max}`}</Typography.Code>
      </Row>

      {/* Dragging the slider must not drag the sheet out from under it. */}
      <ScrollView fill={isLandscape} className="w-full">
        <Column className="p-4" alignment="center">
          <NoDragView>
            <RatingOrSlider
              value={score}
              min={0}
              max={scale.max}
              step={scale.step}
              precision={scale.step}
              onValueChange={(next) =>
                setScore(Number(next.toFixed(scale.step < 1 ? 1 : 0)))
              }
            />
          </NoDragView>
        </Column>
      </ScrollView>

      <Row alignment="center" className="gap-4 px-4">
        <Spacer flexible />
        <Button variant="ghost" cancelRole onPress={onCancel}>
          Cancel
        </Button>
        <Button disabled={score === value} onPress={() => onConfirm(score)}>
          OK
        </Button>
      </Row>
    </Column>
  );
}
