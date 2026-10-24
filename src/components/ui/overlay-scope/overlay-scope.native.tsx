import type { OverlayScopeProps } from "./overlay-scope";

/** Native overlays get their keyboard and screen-reader behavior from the platform. */
export function OverlayScope({ children }: OverlayScopeProps) {
  return <>{children}</>;
}
