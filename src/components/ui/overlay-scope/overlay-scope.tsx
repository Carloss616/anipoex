import type { ReactNode } from "react";

export interface OverlayScopeProps {
  onClose: () => void;
  /** Arrow keys, Home and End move between the rows, as in a menu. */
  arrows?: "vertical" | "horizontal";
  /** Names the scope as a modal dialog, for overlays PanelUI leaves unnamed on web. */
  label?: string;
  className?: string;
  children: ReactNode;
}

/** Native overlays get their keyboard and screen-reader behavior from the platform. */
export function OverlayScope({ children }: OverlayScopeProps) {
  return <>{children}</>;
}
