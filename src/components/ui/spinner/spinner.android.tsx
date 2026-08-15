import {
  ContainedLoadingIndicator,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import {
  graphicsLayer,
  testID as testIDModifier,
} from "@expo/ui/jetpack-compose/modifiers";
import { EnsureHost } from "../host";
import { useSpinnerColor } from "./hooks/use-spinner-color";
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
export function Spinner({
  size = "md",
  color = "primary",
  isLoading = true,
  testID,
}: SpinnerProps) {
  const seedColor = useSpinnerColor(color);
  const m3 = useMaterialColors({ seedColor });
  const scale = SCALES[size];

  if (!isLoading) return null;

  return (
    <EnsureHost matchContents>
      <ContainedLoadingIndicator
        containerColor={
          color === "default" ? undefined : m3.surfaceContainerHighest
        }
        color={color === "default" ? undefined : m3.primary}
        modifiers={[
          ...(scale ? [graphicsLayer({ scaleX: scale, scaleY: scale })] : []),
          ...(testID ? [testIDModifier(String(testID))] : []),
        ]}
      />
    </EnsureHost>
  );
}
