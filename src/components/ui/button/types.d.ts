import type { UniversalBaseProps } from "@expo/ui";
import type { ButtonColors } from "@expo/ui/jetpack-compose";

declare module "panelui-native/components/button" {
  interface ButtonProps extends Pick<UniversalBaseProps, "modifiers"> {
    /** @platform ios */
    cancelRole?: boolean;
    /** @platform android */
    colors?: ButtonColors;
    /** @platform ios, android */
    muted?: boolean;
  }
}
