import { Platform } from "react-native";

/**
 * Native buttons tint their own icons; on web the Icon needs the color spelled
 * out. A `web:` variant can't do it — Uniwind resolves `accent-*` against a
 * detached DOM node, where the platform variant never matches.
 */
export const WEB_ICON_COLOR =
  Platform.OS === "web" ? "accent-accent" : undefined;
