import type { ReactNode } from "react";
import type { Orientation } from "./utils";

export type ArrowKeyGroupProps = {
  /** Called with the index the arrows moved focus to, for groups whose choice follows focus. */
  onMove?: (index: number) => void;
  children: ReactNode;
} & (
  | { orientation: Orientation }
  | {
      /** Cells by `data-index`, so a virtual list reaches ones it hasn't rendered. */
      orientation: "grid";
      columns: number;
      count: number;
      /** Brings an unrendered cell on screen; focus follows once it renders. */
      scrollToIndex: (index: number) => void;
    }
);

/** Native groups get their navigation from the platform's screen reader. */
export function ArrowKeyGroup({ children }: ArrowKeyGroupProps) {
  return <>{children}</>;
}
