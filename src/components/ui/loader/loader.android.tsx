import { ContainedLoadingIndicator } from "@expo/ui/jetpack-compose";
import { graphicsLayer } from "@expo/ui/jetpack-compose/modifiers";
import type { LoaderSize } from "panelui-native/components/loader";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { EnsureHost } from "../host";
import type { LoaderProps } from "./loader";

export const SCALES = {
  sm: 0.8,
  md: 1,
  lg: 1.2,
} as const satisfies Record<LoaderSize, number | null>;

/**
 * Android Loader: same props as [the web one](./loader.tsx), rendered as
 * M3 Expressive's `CircularWavyProgressIndicator`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/progress/
 */
export function Loader({ size = "md" }: LoaderProps) {
  const m3 = useThemeM3Colors();
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
