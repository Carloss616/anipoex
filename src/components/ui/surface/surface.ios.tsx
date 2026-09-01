import { glassEffect } from "@expo/ui/swift-ui/modifiers";
import type { SurfaceProps } from "panelui-native/components/surface";
import { cn } from "panelui-native/utils/cn";
import { Column } from "@/components/layout/column";
import { EnsureHost } from "../host";
import { PADDINGS } from "./constants";

/**
 * iOS Surface: same props as [the web one](./surface.tsx), drawn as a Liquid
 * Glass container. `variant` and `elevated` have no analogue here — the glass
 * takes its tone from whatever sits behind it.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/
 */
export function Surface({
  children,
  variant = "default",
  className,
  padding = "default",
}: SurfaceProps) {
  return (
    <EnsureHost matchContents>
      <Column
        className={cn(PADDINGS[padding], className)}
        modifiers={[
          ...(variant === "transparent"
            ? []
            : [
                glassEffect({
                  glass: {
                    variant: "regular",
                  },
                  shape: "roundedRectangle",
                  cornerRadius: 24,
                }),
              ]),
        ]}
      >
        {children}
      </Column>
    </EnsureHost>
  );
}
