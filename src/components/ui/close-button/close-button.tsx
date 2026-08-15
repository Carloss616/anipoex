import type { ButtonProps } from "panelui-native/components/button";
import { Button } from "../button";
import { Icon } from "../icon";

export interface CloseButtonProps extends ButtonProps {
  /** Size and color for the default ✕. Ignored when children are given. */
  iconProps?: { size?: number; color?: string };
}

export function CloseButton({
  children,
  variant = "ghost",
  size = "icon",
  iconProps,
  ...props
}: CloseButtonProps) {
  return (
    <Button variant={variant} size={size} {...props}>
      {children ?? (
        <Icon
          name={Icon.select({
            ios: "xmark",
            android: require("@expo/material-symbols/close.xml"),
            web: "x",
          })}
          size={iconProps?.size ?? 16}
          color={iconProps?.color}
        />
      )}
    </Button>
  );
}
