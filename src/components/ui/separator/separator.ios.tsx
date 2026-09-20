import { Divider, HStack } from "@expo/ui/swift-ui";
import { padding } from "@expo/ui/swift-ui/modifiers";
import { StyleSheet } from "react-native";
import { withUniwind } from "uniwind";
import { dp } from "@/utils/utils";
import { EnsureHost } from "../host";
import type { SeparatorProps } from "./separator";

function SeparatorBase({
  orientation = "horizontal",
  style,
  testID,
}: SeparatorProps) {
  const vertical = orientation === "vertical";
  const {
    marginHorizontal,
    marginVertical,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
  } = StyleSheet.flatten(style) ?? {};

  // SwiftUI has no margins, so an inset rule — `mx-4` between list rows — has
  // to ask for the gap as padding around itself.
  const inset = {
    leading: dp(marginLeft ?? marginHorizontal),
    trailing: dp(marginRight ?? marginHorizontal),
    top: dp(marginTop ?? marginVertical),
    bottom: dp(marginBottom ?? marginVertical),
  };
  // A bare `padding()` is SwiftUI's *default* padding, not none — so an
  // unstyled rule must carry no modifier at all.
  const modifiers = Object.values(inset).some((value) => value !== undefined)
    ? [padding(inset)]
    : undefined;

  return (
    <EnsureHost
      // Fill along the run, hug the hairline across it.
      matchContents={{ vertical: !vertical, horizontal: vertical }}
      className={vertical ? "h-full" : "w-full"}
    >
      {/* A bare `Divider` draws across; only an HStack stands it on its side. */}
      {vertical ? (
        <HStack>
          <Divider modifiers={modifiers} testID={testID} />
        </HStack>
      ) : (
        <Divider modifiers={modifiers} testID={testID} />
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
