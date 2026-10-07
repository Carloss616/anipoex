import { Column as ComposeColumn } from "@expo/ui/jetpack-compose";
import { fillMaxSize } from "@expo/ui/jetpack-compose/modifiers";
import { cn } from "panelui-native/utils/cn";
import { EnsureHost } from "../../ui/host";
import { Column } from "../column";

/**
 * Fills its parent and centres on both axes. Where the height is unbounded (a
 * scroll, a lazy list) `fillMaxSize` has nothing to fill and it wraps instead.
 */
export function Center({
  children,
  className,
  modifiers,
  ...props
}: React.ComponentProps<typeof Column>) {
  return (
    <EnsureHost className="flex-1">
      <ComposeColumn
        verticalArrangement="center"
        horizontalAlignment="center"
        modifiers={[fillMaxSize()]}
      >
        <Column
          alignment="center"
          className={cn("w-full", className)}
          {...props}
        >
          {children}
        </Column>
      </ComposeColumn>
    </EnsureHost>
  );
}
