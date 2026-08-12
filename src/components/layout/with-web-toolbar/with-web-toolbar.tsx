import type { StackToolbarProps } from "expo-router";
import type { ReactElement } from "react";

export type WebToolbarOptions = {
  /**
   * Web only: spins the mapped button icons while an action is in flight.
   * Ignored on native, where the platform toolbar owns the rendering.
   */
  spinning?: boolean;
};

/**
 * Pass-through on native — `Stack.Toolbar` already drives the header.
 * On web, see `with-web-toolbar.web.tsx`.
 */
export function withWebToolbar(
  toolbar: ReactElement<StackToolbarProps>,
  _options?: WebToolbarOptions,
): ReactElement {
  return toolbar;
}
