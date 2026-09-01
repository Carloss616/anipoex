import type { SurfaceProps } from "panelui-native/components/surface";

type SurfacePadding = NonNullable<SurfaceProps["padding"]>;

export const PADDINGS = {
  none: "p-0",
  sm: "p-2.5",
  default: "p-4",
  lg: "p-6",
} as const satisfies Record<SurfacePadding, string>;
