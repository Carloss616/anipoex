import type { ReactNode } from "react";

export interface SettingsShellProps {
  /** The settings stack. */
  children: ReactNode;
}

/** Whether pages show beside a sidebar: wide web only. */
export const useSettingsSplit = () => false;

/** Native draws only the stack: the sidebar is wide web's. */
export function SettingsShell({ children }: SettingsShellProps) {
  return children;
}
