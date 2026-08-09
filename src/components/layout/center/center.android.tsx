import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
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
          className={className}
          modifiers={[fillMaxWidth(), ...(modifiers ?? [])]}
          {...props}
        >
          {children}
        </Column>
      </Row>
    </EnsureHost>
  );
}
