import type {
  BottomSheetProps as BottomSheetBaseProps,
  SnapPoint,
} from "@expo/ui";
import type { ModalBottomSheetProps } from "@expo/ui/jetpack-compose";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { Sheet, type SheetSide } from "panelui-web/sheet";
import { View, type ViewProps } from "react-native";

/** Web: one 16px inset for every sheet, tighter than panelui-web's 24px. */
export const SHEET_INSET = {
  header: "p-4 pb-0",
  body: "px-4 pt-4",
  footer: "px-4 pb-4",
} as const;

export interface BottomSheetProps
  extends BottomSheetBaseProps,
    Pick<ModalBottomSheetProps, "containerColor" | "scrimColor"> {
  className?: string;
  /** What the sheet shows. iOS only: SwiftUI animates a resize only against a value that changes. */
  contentKey?: string | number;
  /** Each time it turns true the sheet moves to its last snap point; the user can still drag it down. */
  expanded?: boolean;
  /**
   * Direction of the drawer.
   * @platform web
   * @default "bottom" (mobile) | "right" (desktop)
   */
  direction?: SheetSide;
  /**
   * The direction in which the snap points are applied. Leave empty to use any direction.
   * @platform web
   */
  snapPointsDirection?: SheetSide;
}

const isHalf = (snapPoint: SnapPoint) =>
  snapPoint === "half" ||
  (typeof snapPoint === "object" &&
    "fraction" in snapPoint &&
    snapPoint.fraction <= 0.5);

/**
 * PanelUI's web Sheet; children can open a `Sheet.Next` from `panelui-web/sheet`.
 * @see `node_modules/@expo/ui/src/universal/BottomSheet/index.tsx`
 */
function BottomSheetRoot({
  children,
  isPresented,
  onDismiss,
  showDragIndicator = true,
  snapPoints,
  testID,
  className,
  direction,
  snapPointsDirection,
  expanded = false,
}: BottomSheetProps) {
  const { isAtLeast, isLandscape } = useBreakpoint();
  const side =
    direction ?? (isAtLeast("md") || isLandscape ? "right" : "bottom");
  const snaps =
    snapPoints?.length && (!snapPointsDirection || snapPointsDirection === side)
      ? snapPoints
      : undefined;
  // shortcut: Base UI's drawer has no snap points: a sheet opens at its first
  // and `expanded` raises it to full, with no dragging between them.
  const size = !snaps
    ? "auto"
    : expanded || !isHalf(snaps[0])
      ? "full"
      : "half";

  return (
    <Sheet
      open={isPresented}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
      side={side}
    >
      <Sheet.Content
        blur
        size={size}
        showGrabber={showDragIndicator && side === "bottom"}
        showClose={false}
        data-testid={testID}
        // RNW Views don't shrink; drop once the sheets use Sheet.Body.
        className={cn(
          // `!` beats the popup's bg-popover; glass inside starts from its color.
          "glass-sheet! [--glass-base:var(--color-popover)] *:min-h-0 *:shrink",
          className,
        )}
      >
        {children}
      </Sheet.Content>
    </Sheet>
  );
}

/**
 * Wraps a control the sheet must not drag from, like a slider thumb.
 * Inert outside a sheet.
 */
const LockDrag = (props: ViewProps) => (
  <View {...props} data-base-ui-swipe-ignore />
);

export const BottomSheet = Object.assign(BottomSheetRoot, { LockDrag });
