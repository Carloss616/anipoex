import { cn } from "panelui-native/utils/cn";
import { EnsureHost } from "../../ui/host";
import { Column } from "../column";
import { Row } from "../row";

export function Center({
  children,
  className,
  modifiers,
  ...props
}: React.ComponentProps<typeof Column>) {
  return (
    <EnsureHost className="flex-1">
      <Row alignment="center">
        <Column
          alignment="center"
          className={cn("w-full", className)}
          {...props}
        >
          {children}
        </Column>
      </Row>
    </EnsureHost>
  );
}
