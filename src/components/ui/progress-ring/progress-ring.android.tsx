import { CircularProgressIndicator } from "@expo/ui/jetpack-compose";
import { size as sizeModifier } from "@expo/ui/jetpack-compose/modifiers";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { EnsureHost } from "../host";
import type { ProgressRingProps } from "./progress-ring";

/** @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/progress/ */
export function ProgressRing({ value, size = 20 }: ProgressRingProps) {
  const m3 = useThemeM3Colors();

  return (
    <EnsureHost matchContents>
      <CircularProgressIndicator
        progress={value}
        color={m3.primary}
        trackColor={m3.surfaceContainerHighest}
        strokeWidth={2.5}
        modifiers={[sizeModifier(size, size)]}
      />
    </EnsureHost>
  );
}
