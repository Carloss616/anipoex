import {
  ContainedLoadingIndicator,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import { graphicsLayer } from "@expo/ui/jetpack-compose/modifiers";
import { useThemeColor } from "@/hooks/use-theme-color";
import { EnsureHost } from "../host";
import type { SpinnerProps, SpinnerSize } from "./spinner";

export const SCALES = {
  sm: 0.8,
  md: 1,
  lg: 1.2,
} as const satisfies Record<SpinnerSize, number | null>;

/**
 * Android Spinner: same props as [the web one](./spinner.tsx), rendered as
 * M3 Expressive's `CircularWavyProgressIndicator`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/progress/
 */
export function Spinner({ size = "md" }: SpinnerProps) {
  const primary = useThemeColor("primary");
  const m3 = useMaterialColors({ seedColor: primary });
  const scale = SCALES[size];

  return (
    <EnsureHost matchContents>
      <ContainedLoadingIndicator
        containerColor={m3.surfaceContainerHighest}
        color={m3.primary}
        modifiers={
          scale ? [graphicsLayer({ scaleX: scale, scaleY: scale })] : []
        }
      />
    </EnsureHost>
  );
}
