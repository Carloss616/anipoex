import { cn } from "panelui-native/utils/cn";
import { EnsureHost } from "../../ui/host";
import { Column } from "../column";

export type CenterProps = React.ComponentProps<typeof Column>;

export function Center({ children, className, ...props }: CenterProps) {
  return (
    <EnsureHost className="flex-1">
      <Column
        alignment="center"
        className={cn("flex-1 web:justify-center", className)}
        {...props}
      >
        {children}
      </Column>
    </EnsureHost>
  );
}
