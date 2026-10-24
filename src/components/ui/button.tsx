import {
  type ButtonSize,
  Button as PanelButton,
  type ButtonProps as PanelButtonProps,
} from "panelui-native/components/button";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { View } from "react-native";

export * from "panelui-native/components/button";

/** An icon-only button has no text to read, so it must carry a label. */
export type ButtonProps = PanelButtonProps &
  (
    | { size: "icon"; accessibilityLabel: string }
    | { size?: Exclude<ButtonSize, "icon"> }
  );

export const Button = PanelButton as ForwardRefExoticComponent<
  ButtonProps & RefAttributes<View>
>;
