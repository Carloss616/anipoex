import type {
  BottomSheetProps as BottomSheetBaseProps,
  ColumnProps,
  SnapPoint,
} from "@expo/ui";
import type { ModalBottomSheetProps } from "@expo/ui/jetpack-compose";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { Drawer } from "vaul";
import { Column } from "@/components/layout/column";

export interface BottomSheetProps
  extends BottomSheetBaseProps,
    Pick<ColumnProps, "alignment">,
    Pick<ModalBottomSheetProps, "containerColor" | "scrimColor"> {
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
  containerColor,
  scrimColor,
  alignment,
  className,
}: BottomSheetProps) {
  const { isAtLeast } = useBreakpoint();
  const vaulSnapPoints = snapPoints?.length
    ? snapPoints.map(snapPointToVaul)
    : undefined;
  const hasSnapPoints = vaulSnapPoints != null;
  const direction = isAtLeast("md") ? "right" : "bottom";
  const isRight = direction === "right";

  return (
    <Drawer.Root
      open={isPresented}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
      snapPoints={vaulSnapPoints}
      direction={direction}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 bg-black/50 opacity-100!"
          style={
            typeof scrimColor === "string"
              ? { backgroundColor: scrimColor }
              : undefined
          }
        />
        <Drawer.Content
          className={cn(
            "fixed right-0 bottom-0 z-50 flex flex-col border-border bg-popover shadow-sm outline-none",
            isRight
              ? "top-0 rounded-l-[16px] border-l"
              : "left-0 rounded-t-[16px] border-t",
            // Snap-points mode: vaul translates the drawer by `viewport - snapHeight`.
            // The drawer has to fill the viewport or it gets pushed off-screen.
            isRight
              ? hasSnapPoints
                ? "w-[96vw]"
                : "w-full max-w-80"
              : hasSnapPoints
                ? "h-[96vh]"
                : "max-h-[85vh]",
          )}
          style={
            typeof containerColor === "string"
              ? { backgroundColor: containerColor }
              : undefined
          }
          aria-describedby={undefined}
          data-testid={testID}
        >
          {/* Radix Dialog requires a title for a11y; render visually-hidden. */}
          <Drawer.Title className="sr-only">Bottom sheet</Drawer.Title>
          {showDragIndicator && !isRight && (
            <Drawer.Handle className="mt-2 bg-muted-foreground/30" />
          )}
          <Column alignment={alignment} className={className}>
            {children}
          </Column>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
