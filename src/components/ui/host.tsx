import { Host as HostBase, RNHostView as RNHostViewBase } from "@expo/ui";
import { createContext, useContext } from "react";
import { useUniwind, withUniwind } from "uniwind";

export const HostRoot = withUniwind(HostBase);
export const RNHostViewRoot = withUniwind(RNHostViewBase);

const HostContext = createContext(false);
const RNHostViewContext = createContext(false);

export function useIsInsideHost() {
  return useContext(HostContext);
}

export function useIsInsideRNHostView() {
  return useContext(RNHostViewContext);
}

/** `@expo/ui`'s Host, tracked so our components know not to add another one. */
export function Host(props: React.ComponentProps<typeof HostRoot>) {
  const { theme } = useUniwind();

  return (
    <HostContext.Provider value={true}>
      <HostRoot
        seedColorClassName="accent-primary"
        colorScheme={theme}
        {...props}
      />
    </HostContext.Provider>
  );
}

/** `@expo/ui`'s RNHostView, tracked so our components know to add Host if needed. */
export function RNHostView(props: React.ComponentProps<typeof RNHostViewRoot>) {
  return (
    <RNHostViewContext.Provider value={true}>
      <RNHostViewRoot {...props} />
    </RNHostViewContext.Provider>
  );
}

/** Ensures there's exactly one native Host boundary in the tree. */
export function EnsureHost(props: React.ComponentProps<typeof HostRoot>) {
  const isInsideHost = useIsInsideHost();
  const isInsideRNHostView = useIsInsideRNHostView();

  if (isInsideHost && !isInsideRNHostView) {
    return <>{props.children}</>;
  }

  return <Host {...props} />;
}

/** Ensures there's exactly one RNHostView boundary in the host tree. */
export function EnsureRNHostView(
  props: React.ComponentProps<typeof RNHostView>,
) {
  const isInsideHost = useIsInsideHost();

  if (isInsideHost) {
    return <RNHostView {...props}>{props.children}</RNHostView>;
  }

  return props.children;
}
