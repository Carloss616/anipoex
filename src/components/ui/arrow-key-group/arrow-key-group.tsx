import type { ReactNode } from "react";
import type { Orientation } from "./utils";

export interface ArrowKeyGroupProps {
  orientation: Orientation;
  /** Called with the index the arrows moved focus to, for groups whose choice follows focus. */
  onMove?: (index: number) => void;
  children: ReactNode;
}

/** Native groups get their navigation from the platform's screen reader. */
export function ArrowKeyGroup({ children }: ArrowKeyGroupProps) {
  return <>{children}</>;
}
