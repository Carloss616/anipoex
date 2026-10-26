import { ContainedLoadingIndicator } from "@expo/ui/jetpack-compose";
import { size as sizeModifier } from "@expo/ui/jetpack-compose/modifiers";
import type { LoaderSize } from "panelui-native/components/loader";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { EnsureHost } from "../host";
import type { LoaderProps } from "./loader";

// Diameter in dp; 48 is M3's default.
const SIZES = {
  sm: 24,
  md: 48,
  lg: 58,
} as const satisfies Record<LoaderSize, number>;

/**
 * Android Loader: same props as [the web one](./loader.tsx), rendered as
 * M3 Expressive's `ContainedLoadingIndicator`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/progress/
 */
export function Loader({ size = "md" }: LoaderProps) {
  const m3 = useThemeM3Colors();
  const dp = SIZES[size];

  return (
    <EnsureHost matchContents>
      <ContainedLoadingIndicator
        containerColor={m3.surfaceContainerHighest}
        color={m3.primary}
        modifiers={[sizeModifier(dp, dp)]}
      />
    </EnsureHost>
  );
}
