import type {
  LegendListRef,
  LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import {
  LegendList as LegendListBase,
  type LegendListProps as LegendListBaseProps,
} from "@legendapp/list/react-native";
import { useIsFocused } from "expo-router";
import {
  Activity,
  createElement,
  isValidElement,
  useImperativeHandle,
  useRef,
} from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { ArrowKeyGroup } from "@/components/ui/arrow-key-group";

export type { LegendListRef };

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
  keyboardShouldPersistTaps,
  ref,
  ...props
}: LegendListBaseProps<T> & UniwindClassNameProps) {
  const gap =
    columnWrapperStyle?.gap ??
    columnWrapperStyle?.rowGap ??
    columnWrapperStyle?.columnGap ??
    0;
  const halfGap = Number(gap) / 2;
  const horizontal = props.horizontal === true;
  const focused = useIsFocused();
  const listRef = useRef<LegendListRef>(null);
  useImperativeHandle(ref, () => listRef.current as LegendListRef);

  return (
    // Web: a blurred screen is display: none, where the list measures its rows as 0 and keeps adding more
    <Activity mode={Platform.OS === "web" && !focused ? "hidden" : "visible"}>
      <ArrowKeyGroup
        orientation="grid"
        // A rail is one row: only left and right move.
        columns={
          horizontal ? (props.data?.length ?? 0) : (props.numColumns ?? 1)
        }
        count={props.data?.length ?? 0}
        scrollToIndex={(index) => listRef.current?.scrollToIndex({ index })}
      >
        {/* The top margin sits on a wrapper because rn-web puts `style` on both the
      RefreshControl and the ScrollView it wraps, so on the list it would land twice */}
        <View
          // A rail overhangs by its cells' padding, so both ends keep the content padding.
          style={
            horizontal
              ? { margin: -halfGap }
              : {
                  flexGrow: 1,
                  flexShrink: 1,
                  marginTop: ListHeaderComponent ? 0 : -halfGap,
                }
          }
        >
          <LegendListRoot
            ref={listRef}
            // Flattened: the web build's <div>s take one style object, not arrays.
            style={StyleSheet.flatten([
              // a hidden screen measures 0 wide, and the list would size to its widest item
              { width: "auto" },
              !horizontal && { flexGrow: 1 },
              // the content's negative `marginInline` would otherwise scroll sideways
              Platform.OS === "web" &&
                !horizontal &&
                ({ overflowX: "hidden" } as ViewStyle),
              style,
            ])}
            contentContainerStyle={StyleSheet.flatten([
              !horizontal && { marginInline: -halfGap },
              // Web: grows with the cells, so its end padding lands after the last one.
              horizontal &&
                Platform.OS === "web" &&
                ({ width: "max-content" } as unknown as ViewStyle),
              !horizontal && {
                flexGrow: 1,
                marginBottom: -halfGap,
                // a column, so the empty component can fill the height left under the header
                display: "flex",
                flexDirection: "column",
              },
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
              : {
                  ListHeaderComponentClassName,
                  ListFooterComponentClassName,
                  // the browser build would put it on a <div> as an unknown attribute
                  keyboardShouldPersistTaps,
                })}
            ListHeaderComponentStyle={StyleSheet.flatten([
              horizontal ? { padding: halfGap } : { paddingInline: halfGap },
              !horizontal && { marginBottom: -halfGap, zIndex: 1 },
              ListHeaderComponentStyle,
            ])}
            renderItem={(props) => {
              if (!renderItem) return null;

              return (
                // Half the gap on every side, so cells space evenly in both directions.
                <View
                  // ArrowKeyGroup's grid finds cells by it, rendered or not.
                  data-index={props.index}
                  style={{ padding: halfGap }}
                >
                  {renderItem(
                    props as LegendListRenderItemProps<T, string | undefined>,
                  )}
                </View>
              );
            }}
            ListFooterComponentStyle={StyleSheet.flatten([
              // In a rail the footer is one more cell, lined up with the others.
              horizontal ? { padding: halfGap } : { paddingInline: halfGap },
              ListFooterComponentStyle,
            ])}
            {...(props as LegendListBaseProps<unknown>)}
          />
        </View>
      </ArrowKeyGroup>
    </Activity>
  );
}
