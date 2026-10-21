import type { SFSymbol } from "expo-symbols";
import type { IconName } from "./icon";

/** An icon as an SF Symbol name, for SwiftUI props that only take one (`systemImage`); undefined when it has none. */
export function sfSymbol(icon: IconName | undefined): SFSymbol | undefined {
  const name =
    icon && typeof icon === "object" && "ios" in icon ? icon.ios : icon;
  return typeof name === "string" ? (name as SFSymbol) : undefined;
}
