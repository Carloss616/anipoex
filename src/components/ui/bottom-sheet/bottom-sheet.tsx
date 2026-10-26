import type {
  BottomSheetProps as BottomSheetBaseProps,
  SnapPoint,
} from "@expo/ui";
import type { ModalBottomSheetProps } from "@expo/ui/jetpack-compose";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { PortalHost, PortalProvider } from "panelui-native/primitives/portal";
import { cn } from "panelui-native/utils/cn";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { View, type ViewProps } from "react-native";
import { type DialogProps, Drawer } from "vaul";
import { OverlayScope } from "../overlay-scope";

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
  direction?: DialogProps["direction"];
  /**
   * The direction in which the snap points are applied. Leave empty to use any direction.
   * @platform web
   */
  snapPointsDirection?: DialogProps["direction"];
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
function BottomSheetRoot({
  children,
  isPresented,
  onDismiss,
  showDragIndicator = true,
  snapPoints,
  testID,
  containerColor,
  scrimColor,
  className,
  direction: directionProp,
  snapPointsDirection,
  expanded = false,
}: BottomSheetProps) {
  const { isAtLeast } = useBreakpoint();
  const direction = directionProp ?? (isAtLeast("md") ? "right" : "bottom");
  const isRight = direction === "right";
  const isSnapPoints =
    !snapPointsDirection || snapPointsDirection === direction;
  const vaulSnapPoints =
    isSnapPoints && snapPoints?.length
      ? snapPoints.map(snapPointToVaul)
      : undefined;
  const hasSnapPoints = vaulSnapPoints != null;
  const [snap, setSnap] = useState(vaulSnapPoints?.[0] ?? null);
  const portals = useRef<View>(null);
  // A press in a PanelUI portal (a dialog, a menu) is outside the drawer to
  // Radix, which would close the sheet under it.
  const inPortal = (event: Event) => {
    if ((portals.current as unknown as Node)?.contains(event.target as Node))
      event.preventDefault();
  };
  // Raised when `expanded` turns true; back to the first snap point once closed.
  const [last, setLast] = useState({ expanded, isPresented });
  if (expanded !== last.expanded || isPresented !== last.isPresented) {
    setLast({ expanded, isPresented });
    if (!isPresented) setSnap(vaulSnapPoints?.[0] ?? null);
    else if (expanded && !last.expanded)
      setSnap(vaulSnapPoints?.at(-1) ?? null);
  }
  // Radix unmounts a portal child the moment it closes unless that child
  // animates itself, and OverlayScope doesn't: keep it for vaul's exit.
  const [mounted, setMounted] = useState(isPresented);
  if (isPresented && !mounted) setMounted(true);
  // Radix's scroll lock blocks the wheel on all but the drawer: kept from the
  // document, it reaches a PanelUI portal's list (the calendar's month menu).
  useEffect(() => {
    const host = portals.current as unknown as HTMLElement | null;
    if (!mounted || !host) return;
    const stop = (event: Event) => event.stopPropagation();
    host.addEventListener("wheel", stop);
    host.addEventListener("touchmove", stop);
    return () => {
      host.removeEventListener("wheel", stop);
      host.removeEventListener("touchmove", stop);
    };
  }, [mounted]);
  useEffect(() => {
    if (isPresented) return;
    // shortcut: vaul's exit runs 0.5s (TRANSITIONS.DURATION); match it if vaul changes.
    const timer = setTimeout(() => setMounted(false), 500);
    return () => clearTimeout(timer);
  }, [isPresented]);

  return (
    <Drawer.Root
      open={isPresented}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
      snapPoints={vaulSnapPoints}
      {...(hasSnapPoints
        ? { activeSnapPoint: snap, setActiveSnapPoint: setSnap }
        : {})}
      direction={direction}
    >
      <PortalProvider>
        <Drawer.Portal forceMount>
          {mounted && (
            <OverlayScope open={isPresented} onClose={onDismiss}>
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
                      : "w-full max-w-md"
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
                // OverlayScope closes the top-most overlay; Radix would close the sheet on any Escape.
                onEscapeKeyDown={(event) => event.preventDefault()}
                onPointerDownOutside={inPortal}
                onInteractOutside={inPortal}
              >
                {/* Radix Dialog requires a title for a11y; render visually-hidden. */}
                <Drawer.Title className="sr-only">Bottom sheet</Drawer.Title>
                {showDragIndicator && !isRight && (
                  <Drawer.Handle className="mt-2 bg-muted-foreground/30" />
                )}
                {isRight || hasSnapPoints ? (
                  // RNW Views don't shrink, so without this the column outgrows the
                  // drawer and a scrollable child never gets a bounded box.
                  <View className={cn("min-h-0 flex-1", className)}>
                    {children}
                  </View>
                ) : (
                  <AnimatedHeight>
                    <View className={className}>{children}</View>
                  </AnimatedHeight>
                )}
              </Drawer.Content>
              {/* PanelUI portals (Select, Popover) mount here so they paint above the
            drawer. Not inside it: its transform would capture their `fixed`. */}
              <View
                ref={portals}
                pointerEvents="box-none"
                className="fixed inset-0 z-60"
              >
                <PortalHost />
              </View>
            </OverlayScope>
          )}
        </Drawer.Portal>
      </PortalProvider>
    </Drawer.Root>
  );
}

/**
 * The drawer sizes itself to its content, and CSS can't transition `height:
 * auto`. Measuring the content and setting the height gives it something to
 * animate when the sheet swaps to a taller or shorter view.
 */
function AnimatedHeight({ children }: { children: ReactNode }) {
  const [height, setHeight] = useState<number>();

  return (
    <View
      className="overflow-hidden transition-[height] duration-300 ease-sheet"
      style={{ height }}
    >
      <View onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
        {children}
      </View>
    </View>
  );
}

/**
 * Wraps a control the drawer must not drag from, like a slider thumb.
 * Inert outside a drawer.
 */
const LockDrag = (props: ViewProps) => <View {...props} data-vaul-no-drag />;

export const BottomSheet = Object.assign(BottomSheetRoot, { LockDrag });
