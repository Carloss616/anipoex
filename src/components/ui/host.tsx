import { Host as HostBase, RNHostView as RNHostViewBase } from "@expo/ui";
import { createContext, useContext } from "react";
import { useUniwind, withUniwind } from "uniwind";

export const RNHostView = withUniwind(RNHostViewBase);
export const HostRoot = withUniwind(HostBase);
const HostContext = createContext(false);

/**
 * True when a native Host is already an ancestor. A nested Host is a plain
 * Android/iOS view, which breaks the Compose/SwiftUI composition boundary:
 * "must be rendered as a direct child of a <Host> component".
 */
export function useIsInsideHost() {
  return useContext(HostContext);
}

/** `@expo/ui`'s Host, tracked so our components know not to add another one. */
export function Host(props: React.ComponentProps<typeof HostRoot>) {
  const { theme } = useUniwind();

  return (
    <HostContext.Provider value={true}>
      <HostRoot
        seedColorClassName="accent-accent"
        colorScheme={theme}
        {...props}
      />
    </HostContext.Provider>
  );
}

/** Ensures there's exactly one native Host boundary in the tree. */
export function EnsureHost(props: React.ComponentProps<typeof HostRoot>) {
  const isInsideHost = useIsInsideHost();

  if (isInsideHost) {
    return <>{props.children}</>;
  }

  return <Host {...props} />;
}
