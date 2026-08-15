import { cn } from "panelui-native/utils/cn";
import { EnsureHost } from "../../ui/host";
import { Column } from "../column";

export function Center({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Column>) {
  return (
    <EnsureHost className="flex-1">
      <Column
        alignment="center"
        className={cn("web:flex-1 web:justify-center", className)}
        {...props}
      >
        {children}
      </Column>
    </EnsureHost>
  );
}
