import { Surface as JetpackSurface } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  fillMaxWidth,
  Shapes,
} from "@expo/ui/jetpack-compose/modifiers";
import type { SurfaceProps } from "panelui-native/components/surface";
import { cn } from "panelui-native/utils/cn";
import { Column } from "@/components/layout/column";
import { EnsureHost } from "../host";
import { PADDINGS } from "./constants";

type SurfaceVariant = NonNullable<SurfaceProps["variant"]>;

const VARIANTS = {
  default: 0,
  secondary: 1,
  tertiary: 3,
  transparent: 0,
} as const satisfies Record<SurfaceVariant, number>;

/**
 * Android Surface: same props as [the web one](./surface.tsx), drawn as M3's
 * `Surface` — `variant` picks the tonal elevation, `elevated` adds the shadow.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/surface/
 */
export function Surface({
  children,
  variant = "default",
  elevated,
  className,
  padding = "default",
}: SurfaceProps) {
  return (
    <EnsureHost matchContents>
      <JetpackSurface
        tonalElevation={VARIANTS[variant]}
        shadowElevation={elevated ? 1 : 0}
        modifiers={[
          ...(variant === "transparent" ? [background("transparent")] : []),
          clip(Shapes.RoundedCorner(12)),
          fillMaxWidth(),
        ]}
      >
        <Column className={cn(PADDINGS[padding], className)}>{children}</Column>
      </JetpackSurface>
    </EnsureHost>
  );
}
