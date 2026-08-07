import { Divider, HStack } from "@expo/ui/swift-ui";
import { Separator as SeparatorView } from "heroui-native/separator";
import { withUniwind } from "uniwind";
import { Host, useIsInsideHost } from "./host";
import type { SeparatorProps } from "./separator";

function SeparatorBase(props: SeparatorProps) {
  const {
    orientation = "horizontal",
    variant = "thin",
    thickness,
    testID,
  } = props;
  const isInsideHost = useIsInsideHost();
  const vertical = orientation === "vertical";

  // A bare `Divider` draws across; only an HStack stands it on its side.
  const divider = vertical ? (
    <HStack>
      <Divider testID={testID} />
    </HStack>
  ) : (
    <Divider testID={testID} />
  );

  if (isInsideHost) return divider;

  // SwiftUI's `Divider` is the system hairline and nothing else, so a thick
  // rule falls back to the shared View.
  if (variant === "thick" || thickness !== undefined)
    return <SeparatorView {...props} />;

  return (
    <Host
      // Fill along the run, hug the hairline across it.
      matchContents={{ vertical: !vertical, horizontal: vertical }}
      className={vertical ? "h-full" : "w-full"}
    >
      {divider}
    </Host>
  );
}

/**
 * iOS Separator: same props as [the web one](./separator.tsx), drawn as a
 * SwiftUI `Divider`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/divider/
 */
export const Separator = withUniwind(SeparatorBase);
