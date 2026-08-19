import type {
  BottomSheetProps as BottomSheetBaseProps,
  ColumnProps,
  SnapPoint,
} from "@expo/ui";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { View } from "react-native";
import { Drawer } from "vaul";

export interface BottomSheetProps
  extends BottomSheetBaseProps,
    Pick<ColumnProps, "alignment"> {
  className?: string;
}

function snapPointToVaul(snapPoint: SnapPoint): string | number {
  if (snapPoint === "half") return 0.5;
  if (snapPoint === "full") return 1;
  if ("fraction" in snapPoint) return snapPoint.fraction;
  return `${snapPoint.height}px`;
}

/**
 * A modal sheet that slides up from the bottom of the screen.
 * @see `node_modules/@expo/ui/src/universal/BottomSheet/index.tsx`
 */
export function BottomSheet({
  children,
  isPresented,
  onDismiss,
  showDragIndicator = true,
  snapPoints,
  testID,
  alignment,
  className,
}: BottomSheetProps) {
  const { isAtLeast } = useBreakpoint();
  const vaulSnapPoints = snapPoints?.length
    ? snapPoints.map(snapPointToVaul)
    : undefined;
  const hasSnapPoints = vaulSnapPoints != null;

  return (
    <Drawer.Root
      open={isPresented}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
      snapPoints={vaulSnapPoints}
      direction={isAtLeast("md") ? "right" : "bottom"}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 opacity-100" />
        <Drawer.Content
          className={cn(
            "fixed right-0 bottom-0 left-0 z-50 flex flex-col rounded-t-[16px] border-border border-t bg-popover shadow-sm outline-none",
            // Snap-points mode: vaul translates the drawer by `viewport - snapHeight`.
            // The drawer has to fill the viewport or it gets pushed off-screen.
            hasSnapPoints ? "h-[96vh]" : "max-h-[85vh]",
            showDragIndicator && "pt-16",
          )}
          aria-describedby={undefined}
        >
          {/* Radix Dialog requires a title for a11y; render visually-hidden. */}
          <Drawer.Title className="sr-only">Bottom sheet</Drawer.Title>
          {showDragIndicator && (
            <Drawer.Handle className="bg-muted-foreground/30" />
          )}
          <View
            className={cn(
              alignment === "center"
                ? "items-center"
                : alignment === "end"
                  ? "items-end"
                  : undefined,
              className,
            )}
            data-testid={testID}
          >
            {children}
          </View>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
