import type { ArrowKeyGroupProps } from "./arrow-key-group";

/** Native groups get their navigation from the platform's screen reader. */
export function ArrowKeyGroup({ children }: ArrowKeyGroupProps) {
  return <>{children}</>;
}
