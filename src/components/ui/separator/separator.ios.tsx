import { Divider, HStack } from "@expo/ui/swift-ui";
import { withUniwind } from "uniwind";
import { EnsureHost } from "../host";
import type { SeparatorProps } from "./separator";

function SeparatorBase({ orientation = "horizontal", testID }: SeparatorProps) {
  const vertical = orientation === "vertical";

  return (
    <EnsureHost
      // Fill along the run, hug the hairline across it.
      matchContents={{ vertical: !vertical, horizontal: vertical }}
      className={vertical ? "h-full" : "w-full"}
    >
      {/* A bare `Divider` draws across; only an HStack stands it on its side. */}
      {vertical ? (
        <HStack>
          <Divider testID={testID} />
        </HStack>
      ) : (
        <Divider testID={testID} />
      )}
    </EnsureHost>
  );
}

/**
 * iOS Separator: same props as [the web one](./separator.tsx), drawn as a
 * SwiftUI `Divider`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/divider/
 */
export const Separator = withUniwind(SeparatorBase);
