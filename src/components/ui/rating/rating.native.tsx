import type { RatingProps } from "panelui-native/components/rating";
import { Rating as RatingBase } from "panelui-native/components/rating";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { EnsureRNHostView } from "../host";

/**
 * PanelUI's Rating as an RN island, track only: the caption props are dropped
 * so PanelUI doesn't draw its own row, and the gesture-handler root is the one
 * the island otherwise lands outside of.
 */
export function Rating({
  label: _label,
  showValue: _showValue,
  formatValue: _formatValue,
  headerClassName: _headerClassName,
  ...props
}: RatingProps) {
  return (
    <EnsureRNHostView matchContents>
      {/* `flex-0` so the island wraps its content, as matchContents expects. */}
      <GestureHandlerRootView style={{ flex: 0, width: "100%" }}>
        <RatingBase {...props} />
      </GestureHandlerRootView>
    </EnsureRNHostView>
  );
}
