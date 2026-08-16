import { ProgressView } from "@expo/ui/swift-ui";
import {
  controlSize,
  progressViewStyle,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import type { LoaderSize } from "panelui-native/components/loader";
import { useThemeColor } from "@/hooks/use-theme-color";
import { EnsureHost } from "../host";
import type { LoaderProps } from "./loader";

type ControlSize = Parameters<typeof controlSize>[0];

const SIZES = {
  sm: "small",
  md: "regular",
  lg: "large",
} as const satisfies Record<LoaderSize, ControlSize>;

/**
 * iOS Loader: same props as [the web one](./loader.tsx), rendered as a
 * circular SwiftUI `ProgressView`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/progressview/
 */
export function Loader({ size = "md" }: LoaderProps) {
  const primary = useThemeColor("primary");

  return (
    <EnsureHost matchContents>
      <ProgressView
        modifiers={[
          progressViewStyle("circular"),
          controlSize(SIZES[size]),
          tint(primary),
        ]}
      />
    </EnsureHost>
  );
}
