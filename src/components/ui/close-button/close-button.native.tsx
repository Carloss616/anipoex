import type { CloseButtonProps } from "heroui-native/close-button";
import { Button } from "../button";
import { Icon } from "../icon";

export type * from "heroui-native/close-button";

/**
 * Native CloseButton: the platform `Button` in icon-only mode, with the same
 * defaults as `heroui-native`'s — `tertiary`, `sm`, `isIconOnly`.
 *
 * @see https://heroui.com/docs/native/components/close-button
 */
export function CloseButton({
  children,
  variant = "tertiary",
  size = "sm",
  isIconOnly = true,
  iconProps,
  ...props
}: CloseButtonProps) {
  return (
    <Button variant={variant} size={size} isIconOnly={isIconOnly} {...props}>
      {children ?? (
        <Icon
          name={Icon.select({
            ios: "xmark",
            android: require("@expo/material-symbols/close.xml"),
          })}
          size={iconProps?.size ?? 16}
          color={iconProps?.color}
        />
      )}
    </Button>
  );
}
