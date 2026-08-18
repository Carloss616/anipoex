import { BottomSheet, type BottomSheetProps } from "@expo/ui";
import {
  Drawer,
  type DrawerContentProps,
} from "panelui-native/components/drawer";
import {
  type Breakpoint,
  useBreakpoint,
} from "panelui-native/hooks/use-breakpoint";
import type { ReactNode } from "react";
import { Host, HostBoundary } from "./host";

export interface SheetProps
  extends Pick<
      BottomSheetProps,
      | "isPresented"
      | "onDismiss"
      | "showDragIndicator"
      | "snapPoints"
      | "testID"
    >,
    Pick<DrawerContentProps, "side" | "showClose" | "closeSide"> {
  /** Width at which the sheet becomes a drawer instead. */
  breakpoint?: Breakpoint;
  children?: ReactNode;
}

/**
 * A modal panel: the platform's bottom sheet on a narrow window, a side drawer
 * on a wide one.
 *
 * The sheet renders children as SwiftUI / Compose, the drawer as plain React
 * Native. Our own `ui/` components work in both.
 */
export function Sheet({
  isPresented,
  onDismiss,
  breakpoint = "md",
  side = "end",
  closeSide = "end",
  children,
  showClose,
  ...props
}: SheetProps) {
  const { isAtLeast } = useBreakpoint();

  if (isAtLeast(breakpoint)) {
    return (
      <Drawer
        open={isPresented}
        onOpenChange={(open) => {
          if (!open) onDismiss();
        }}
      >
        {/* Swipe is off until PanelUI fixes it: the drag animates the panel
            out, then the unmount's exiting animation snaps it back and closes
            it a second time. Close button and backdrop are unaffected. */}
        <Drawer.Content
          side={side}
          closeSide={closeSide}
          showClose={showClose}
          swipeToDismiss={false}
        >
          <Drawer.Body>
            <Host className="flex-1">{children}</Host>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );
  }

  return (
    <BottomSheet isPresented={isPresented} onDismiss={onDismiss} {...props}>
      {/* The children already sit in a native host — @expo/ui's own, which our
          context can't see. */}
      <HostBoundary>{children}</HostBoundary>
    </BottomSheet>
  );
}
