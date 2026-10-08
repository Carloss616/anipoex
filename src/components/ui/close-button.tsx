import type { ButtonProps } from "panelui-native/components/button";
import { cn } from "panelui-native/utils/cn";
import { Platform } from "react-native";
import { Button } from "./button";
import { BUTTON_ICON_SIZE, Icon } from "./icon";

type IconProps = React.ComponentProps<typeof Icon>;

export interface CloseButtonProps extends ButtonProps {
  /** Size and color for the default ✕. Ignored when children are given. */
  iconProps?: Pick<IconProps, "size" | "color" | "muted" | "className">;
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
      className={cn("web:size-9", className)}
      muted
      {...props}
    >
      {children ?? (
        <Icon
          name={Icon.select({
            ios: "xmark",
            android: require("@expo/material-symbols/close.xml"),
            web: "x",
          })}
          size={BUTTON_ICON_SIZE}
          {...(Platform.OS === "web" ? { muted: true } : { color: "inherit" })}
          {...iconProps}
        />
      )}
    </Button>
  );
}
