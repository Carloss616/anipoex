import { Host as HostBase } from "@expo/ui";
import { useThemeColor } from "heroui-native/hooks";
import { createContext, useContext } from "react";
import { useUniwind, withUniwind } from "uniwind";

export type * from "@expo/ui";

const HostRoot = withUniwind(HostBase);
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
  const accent = useThemeColor("accent");

  return (
    <HostContext.Provider value={true}>
      <HostRoot seedColor={accent} colorScheme={theme} {...props} />
    </HostContext.Provider>
  );
}
