import type { UniversalBaseProps } from "@expo/ui";

export type StyleModifiers = Pick<UniversalBaseProps, "style" | "modifiers">;

/** Web lays itself out with the percentages it was handed; nothing to translate. */
export function resolveFill(props: StyleModifiers): StyleModifiers {
  return props;
}
