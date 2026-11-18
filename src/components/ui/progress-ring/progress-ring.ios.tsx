import { ZStack } from "@expo/ui/swift-ui";
import { useThemeColor } from "@/hooks/use-theme-color";
import { EnsureHost, RNHostView } from "../host";
import { Icon } from "../icon";
import type { ProgressRingProps } from "./progress-ring";
import { SvgRing } from "./svg-ring";

/** SwiftUI's circular `ProgressView` spins and ignores its value: an SVG island. */
export function ProgressRing({
  value,
  size = 18,
  icon,
  stroke,
}: ProgressRingProps) {
  const primary = useThemeColor("primary");

  return (
    <EnsureHost matchContents>
      <ZStack>
        <RNHostView matchContents>
          <SvgRing value={value} size={size} stroke={stroke} />
        </RNHostView>
        {icon && (
          <Icon name={icon} size={Math.round(size / 2)} color={primary} />
        )}
      </ZStack>
    </EnsureHost>
  );
}
