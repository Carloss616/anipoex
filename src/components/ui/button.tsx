import {
  type ButtonSize,
  Button as PanelButton,
  type ButtonProps as PanelButtonProps,
} from "panelui-native/components/button";
import { cn } from "panelui-native/utils/cn";
import { forwardRef } from "react";
import type { View } from "react-native";
import { FOCUS_RING, HOVER } from "./constants";

export * from "panelui-native/components/button";

/** An icon-only button has no text to read, so it must carry a label. */
export type ButtonProps = PanelButtonProps &
  (
    | { size: "icon"; accessibilityLabel: string }
    | { size?: Exclude<ButtonSize, "icon"> }
  );

/** PanelUI's Button with a themed focus ring and hover on web. */
export const Button = forwardRef<View, ButtonProps>(function Button(
  { className, ...props },
  ref,
) {
  return (
    <PanelButton
      ref={ref}
      {...props}
      className={cn(FOCUS_RING, HOVER, className)}
    />
  );
});
