import type { ButtonProps } from "panelui-native/components/button";
import { cn } from "panelui-native/utils/cn";
import { Button } from "../button";
import { Icon } from "../icon";

export interface CloseButtonProps extends ButtonProps {
  /** Size and color for the default ✕. Ignored when children are given. */
  iconProps?: { size?: number; color?: string };
}

export function CloseButton({
  children,
  variant = "secondary",
  size = "icon",
  className,
  iconProps,
  ...props
}: CloseButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("size-9", className)}
      {...props}
    >
      {children ?? (
        <Icon
          name={Icon.select({
            ios: "xmark",
            android: require("@expo/material-symbols/close.xml"),
            web: "x",
          })}
          size={iconProps?.size}
          color={iconProps?.color}
        />
      )}
    </Button>
  );
}
