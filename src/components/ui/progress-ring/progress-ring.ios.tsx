import { ProgressView } from "@expo/ui/swift-ui";
import { frame, progressViewStyle, tint } from "@expo/ui/swift-ui/modifiers";
import { useThemeColor } from "@/hooks/use-theme-color";
import { EnsureHost } from "../host";
import type { ProgressRingProps } from "./progress-ring";

/** @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/progressview/ */
export function ProgressRing({ value, size = 18 }: ProgressRingProps) {
  const primary = useThemeColor("primary");

  return (
    <EnsureHost matchContents>
      <ProgressView
        value={value}
        modifiers={[
          progressViewStyle("circular"),
          tint(primary),
          frame({ width: size, height: size }),
        ]}
      />
    </EnsureHost>
  );
}
