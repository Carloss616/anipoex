import type { ReactElement } from "react";
import type { StackToolbarProps } from "./utils";

export type ToolbarProps = {
  children: ReactElement<StackToolbarProps>;
  /**
   * While an action is in flight, the button that started it shows a loader
   * in place of its icon. Elsewhere, a `tintColor` on the item shows it.
   * @platform web
   */
  loading?: boolean;
};

/**
 * Pass-through on iOS — UIKit already draws `Stack.Toolbar` in the app's tint.
 * Android redraws it in Compose (`toolbar.android.tsx`), the web maps it onto
 * the header (`toolbar.web.tsx`).
 */
export function Toolbar({ children }: ToolbarProps) {
  return children;
}
