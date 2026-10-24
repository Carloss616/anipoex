import type { ReactNode } from "react";

export interface OverlayScopeProps {
  /** False while the overlay plays its exit animation: it stays mounted but lets go of focus, Escape and the page. */
  open?: boolean;
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
