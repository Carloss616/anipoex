import {
  type CalendarMode,
  type CalendarProps,
  Calendar as PanelCalendar,
} from "panelui-native/components/calendar";
import { PortalHost, PortalProvider } from "panelui-native/primitives/portal";
import { cn } from "panelui-native/utils/cn";
import { createPortal } from "react-dom";
import { View } from "react-native";

export * from "panelui-native/components/calendar";

/** PanelUI's Calendar with hover, press and focus styles on web. */
export function Calendar<Mode extends CalendarMode = "single">({
  className,
  ...props
}: CalendarProps<Mode>) {
  return (
    // Its month and year menus are PanelUI portals: hosted on <body> over a
    // sheet, whose transform would capture their `fixed` and whose page Base
    // UI hides.
    <PortalProvider>
      <PanelCalendar
        {...props}
        className={cn(
          "motion-reduce:active:scale-100 motion-reduce:data-popup-open:scale-100",
          // all buttons
          "**:[[role=button]]:outline-none",
          "**:[[role=button]]:transition-[scale]",
          "**:[[role=button]]:duration-150",
          "**:[[role=button]]:active:not-disabled:scale-[0.97]",
          "**:[[role=button]]:data-popup-open:scale-[0.97]",
          // header buttons
          "[&_[role=button]:not([role=list]_*)]:focus-visible:ring-3",
          "[&_[role=button]:not([role=list]_*)]:focus-visible:ring-ring/40",
          "[&_[role=button]:not([role=list]_*)]:hover:not-disabled:bg-secondary/80",
          // days buttons
          "[&_[role=list]_[role=button]:focus-visible>:last-child]:ring-3",
          "[&_[role=list]_[role=button]:focus-visible>:last-child]:ring-ring/40",
          "[&_[role=list]_[role=button]:hover:not(:disabled)>:last-child:not(.bg-primary)]:bg-secondary/80",
          className,
        )}
      />
      {typeof document !== "undefined" &&
        createPortal(
          <View
            pointerEvents="box-none"
            className={cn(
              "fixed inset-0 z-60",
              // menu buttons
              "**:[[role=button]]:outline-none",
              "**:[[role=button]]:focus-visible:bg-accent",
              "**:[[role=button]]:hover:not-disabled:bg-accent",
            )}
          >
            <PortalHost />
          </View>,
          document.body,
        )}
    </PortalProvider>
  );
}
