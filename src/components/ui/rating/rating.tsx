import {
  Rating as PanelRating,
  type RatingProps,
} from "panelui-native/components/rating";
import { HiddenRange } from "../hidden-range";

export * from "panelui-native/components/rating";

/** PanelUI's Rating with a hidden range input, so the keyboard can adjust it on web. */
export function Rating({
  accessibilityLabel,
  ...props
}: RatingProps & {
  /** Names the control for screen readers, without the visible `label`. @platform web */
  accessibilityLabel?: string;
}) {
  const { value, onValueChange, max = 5, precision = 1 } = props;
  if (value === undefined || !onValueChange) return <PanelRating {...props} />;

  return (
    <HiddenRange
      value={value}
      min={0}
      max={max}
      step={precision}
      label={accessibilityLabel ?? props.label ?? ""}
      onChange={onValueChange}
    >
      <PanelRating {...props} />
    </HiddenRange>
  );
}
