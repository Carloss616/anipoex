import type { LegendListRenderItemProps } from "@legendapp/list/react-native";
import {
  LegendList as LegendListBase,
  type LegendListProps as LegendListBaseProps,
} from "@legendapp/list/react-native";
import { createElement, isValidElement } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { withUniwind } from "uniwind";
import { resolveSpacing } from "@/utils/resolve-spacing";

const LegendListNative = withUniwind(LegendListBase, {
  ListHeaderComponentStyle: {
    fromClassName: "ListHeaderComponentClassName",
  },
  ListFooterComponentStyle: {
    fromClassName: "ListFooterComponentClassName",
  },
});

/**
 * On web the list is its browser build: plain <div>s, not react-native-web.
 * `withUniwind` hands class names over as `{ $$css: true }` style entries that
 * only react-native-web turns into CSS classes; these <div>s would drop them.
 * So on web the class names go straight through: the browser build takes
 * `className` and `contentContainerClassName` as real CSS classes, and the
 * header and footer, which have no class prop there, get theirs from
 * `classedSlot`.
 */
const LegendListRoot = (
  Platform.OS === "web" ? LegendListBase : LegendListNative
) as typeof LegendListNative;

/** Web: the slot inside a react-native-web view carrying its class. */
function classedSlot(
  slot: LegendListBaseProps<unknown>["ListHeaderComponent"],
  className: string | undefined,
) {
  if (Platform.OS !== "web" || !className || !slot) return slot;

  return (
    <View className={className}>
      {isValidElement(slot) ? slot : createElement(slot as React.ComponentType)}
    </View>
  );
}

type UniwindClassNameProps = Omit<
  React.ComponentProps<typeof LegendListNative>,
  keyof LegendListBaseProps<unknown>
>;

export function LegendList<T>({
  style,
  contentContainerStyle,
  ListHeaderComponent,
  ListHeaderComponentClassName,
  ListHeaderComponentStyle,
  ListFooterComponent,
  ListFooterComponentClassName,
  ListFooterComponentStyle,
  renderItem,
  // never forwarded: its own gap handling is web-only, and would stack on the padding below
  columnWrapperStyle,
  ...props
}: LegendListBaseProps<T> & UniwindClassNameProps) {
  const gap =
    columnWrapperStyle?.gap ??
    columnWrapperStyle?.rowGap ??
    columnWrapperStyle?.columnGap ??
    0;
  const halfGap = gap / 2;

  return (
    // On a wrapper because rn-web puts `style` on both the RefreshControl and the
    // ScrollView it wraps, so a margin on the list itself lands twice
    <View
      style={{
        flexGrow: 1,
        flexShrink: 1,
        marginHorizontal: halfGap ? resolveSpacing(-halfGap) : 0,
        marginTop: gap && !ListHeaderComponent ? resolveSpacing(-gap) : 0,
      }}
    >
      <LegendListRoot
        // Flattened: the web build's <div>s take one style object, not arrays.
        style={StyleSheet.flatten([
          // a hidden screen measures 0 wide, and the list would size to its widest item
          { width: "auto", flexGrow: 1 },
          style,
        ])}
        contentContainerStyle={StyleSheet.flatten([
          { flexGrow: 1 },
          contentContainerStyle,
        ])}
        ListHeaderComponent={classedSlot(
          ListHeaderComponent,
          ListHeaderComponentClassName,
        )}
        ListFooterComponent={classedSlot(
          ListFooterComponent,
          ListFooterComponentClassName,
        )}
        {...(Platform.OS === "web"
          ? {}
          : { ListHeaderComponentClassName, ListFooterComponentClassName })}
        ListHeaderComponentStyle={StyleSheet.flatten([
          halfGap ? { paddingHorizontal: resolveSpacing(halfGap) } : {},
          gap ? { marginBottom: resolveSpacing(-gap), zIndex: 1 } : {},
          ListHeaderComponentStyle,
        ])}
        renderItem={(props) => {
          if (!renderItem) return null;

          return (
            <View
              style={{
                paddingHorizontal: resolveSpacing(halfGap),
                paddingTop: resolveSpacing(gap),
              }}
            >
              {renderItem(
                props as LegendListRenderItemProps<T, string | undefined>,
              )}
            </View>
          );
        }}
        ListFooterComponentStyle={StyleSheet.flatten([
          halfGap ? { paddingHorizontal: resolveSpacing(halfGap) } : {},
          ListFooterComponentStyle,
        ])}
        {...(props as LegendListBaseProps<unknown>)}
      />
    </View>
  );
}
