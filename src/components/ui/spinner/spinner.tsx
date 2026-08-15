export * from "panelui-native/components/spinner";

import type { SpinnerProps } from "panelui-native/components/spinner";

/** PanelUI derives it from its variants and does not export it. */
export type SpinnerSize = NonNullable<SpinnerProps["size"]>;
