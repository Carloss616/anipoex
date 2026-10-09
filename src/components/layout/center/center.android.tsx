import { Column, Spacer } from "@expo/ui/jetpack-compose";
import {
  fillMaxSize,
  height,
  padding,
} from "@expo/ui/jetpack-compose/modifiers";
import { Children, Fragment, isValidElement } from "react";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { contentPaddingOf, dp } from "@/utils/utils";
import { EnsureHost } from "../../ui/host";
import type { CenterProps } from "./center";

/**
 * One Compose `Column`, centred on both axes. `modifiers` sit between the fill
 * and the padding, so a `verticalScroll()` keeps the viewport as the minimum
 * height. `gap-*` becomes spacers: `@expo/ui`'s `spacedBy` has no alignment.
 */
function CenterRoot({
  children,
  modifiers = [],
  style,
}: Omit<CenterProps, "className"> & { style?: StyleProp<ViewStyle> }) {
  const s = StyleSheet.flatten(style) ?? {};
  const gap = dp(s.rowGap) ?? dp(s.gap);
  const p = contentPaddingOf(s);

  return (
    <EnsureHost className="flex-1">
      <Column
        verticalArrangement="center"
        horizontalAlignment="center"
        modifiers={[
          fillMaxSize(),
          ...modifiers,
          padding(p.start ?? 0, p.top ?? 0, p.end ?? 0, p.bottom ?? 0),
        ]}
      >
        {Children.toArray(children).map((child, i) => (
          <Fragment key={isValidElement(child) ? child.key : i}>
            {i > 0 && !!gap && <Spacer modifiers={[height(gap)]} />}
            {child}
          </Fragment>
        ))}
      </Column>
    </EnsureHost>
  );
}

export const Center = withUniwind(CenterRoot, {
  style: { fromClassName: "className" },
});
