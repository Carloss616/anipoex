import type { ReactElement } from "react";
import type { StackToolbarProps } from "./utils";

export type ToolbarProps = {
  children: ReactElement<StackToolbarProps>;
  /**
   * Web only: while an action is in flight, spins the icon of the button it
   * disabled — the one that started it. Ignored elsewhere, where a `tintColor`
   * on the item is the way to show it.
   * @platform web
   */
  spinning?: boolean;
};

/**
 * Pass-through on iOS — UIKit already draws `Stack.Toolbar` in the app's tint.
 * Android redraws it in Compose (`toolbar.android.tsx`), the web maps it onto
 * the header (`toolbar.web.tsx`).
 */
export function Toolbar({ children }: ToolbarProps) {
  return children;
}
