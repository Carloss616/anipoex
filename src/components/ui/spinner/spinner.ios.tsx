import { ProgressView } from "@expo/ui/swift-ui";
import {
  controlSize,
  progressViewStyle,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { EnsureHost } from "../host";
import { useSpinnerColor } from "./hooks/use-spinner-color";
import type { SpinnerProps, SpinnerSize } from "./spinner";

type ControlSize = Parameters<typeof controlSize>[0];

const SIZES = {
  sm: "small",
  md: "regular",
  lg: "large",
} as const satisfies Record<SpinnerSize, ControlSize>;

/**
 * iOS Spinner: same props as [the web one](./spinner.tsx), rendered as a
 * circular SwiftUI `ProgressView`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/progressview/
 */

export function Spinner({
  size = "md",
  color = "primary",
  isLoading = true,
  testID,
}: SpinnerProps) {
  const tintColor = useSpinnerColor(color);

  if (!isLoading) return null;

  return (
    <EnsureHost matchContents>
      <ProgressView
        modifiers={[
          progressViewStyle("circular"),
          controlSize(SIZES[size]),
          ...(color === "default" ? [] : [tint(tintColor)]),
        ]}
        testID={testID as string | undefined}
      />
    </EnsureHost>
  );
}
