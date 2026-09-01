import type { RatingProps } from "panelui-native/components/rating";
import { Rating as RatingBase } from "panelui-native/components/rating";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { EnsureRNHostView } from "../host";
import { TrackHeader } from "../track-header";

/**
 * PanelUI's Rating adapted to native: the app's caption row instead of its own
 * (`label` stays out of PanelUI's props or it draws a second one), plus the
 * gesture-handler root the RN island otherwise lands outside of.
 */
export function Rating({
  label,
  showValue = false,
  formatValue,
  headerClassName,
  ...props
}: RatingProps) {
  const current = props.value ?? props.defaultValue ?? 0;

  return (
    <TrackHeader
      label={label}
      headerClassName={headerClassName}
      valueLabel={
        showValue ? (formatValue?.(current) ?? String(current)) : undefined
      }
      track={
        <EnsureRNHostView matchContents>
          {/* `flex-0` so the island wraps its content, as matchContents expects. */}
          <GestureHandlerRootView style={{ flex: 0, width: "100%" }}>
            <RatingBase {...props} />
          </GestureHandlerRootView>
        </EnsureRNHostView>
      }
    />
  );
}
