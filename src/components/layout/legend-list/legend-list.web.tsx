import { LegendList as LegendListBase } from "@legendapp/list/react";
import { useIsFocused } from "expo-router";
import { cn } from "panelui-native/utils/cn";
import { createElement, isValidElement, type ReactNode } from "react";
import { View } from "react-native";
import { AnimatedLegendList } from "../animated-legend-list";
import { Frozen } from "../frozen";
import type { LegendListProps } from "./legend-list";

/** There is no class prop for a header or footer: wrap it in a classed View. */
function classedSlot(
  slot: LegendListProps<unknown>["ListHeaderComponent"],
  className: string | undefined,
) {
  if (!className || !slot) return slot;

  return (
    <View className={className}>
      {isValidElement(slot) ? slot : createElement(slot as React.ComponentType)}
    </View>
  );
}

export function LegendList<T>({
  className,
  contentContainerClassName,
  ListHeaderComponent,
  ListHeaderComponentClassName,
  ListFooterComponent,
  ListFooterComponentClassName,
  renderItem,
  // A <div> would take it as an unknown attribute
  keyboardShouldPersistTaps: _,
  itemLayoutAnimation,
  visibleWhenBlurred = false,
  ...props
}: LegendListProps<T>) {
  const Root = (itemLayoutAnimation
    ? AnimatedLegendList
    : LegendListBase) as unknown as (props: LegendListProps<T>) => ReactNode;
  const horizontal = props.horizontal === true;
  const focused = useIsFocused();

  return (
    // Blurred screens are display: none: rows measure 0 and the list keeps adding
    <Frozen frozen={!focused && !visibleWhenBlurred}>
      <Root
        {...(itemLayoutAnimation && { itemLayoutAnimation })}
        className={cn(
          "w-auto",
          !horizontal && "shrink grow",
          // Cells clip their paint; the one holding focus lets the ring out.
          "[&_div:has(>[data-index]_:focus-visible)]:z-1",
          "[&_div:has(>[data-index]_:focus-visible)]:contain-[layout_style]!",
          className,
        )}
        contentContainerClassName={cn(
          horizontal ? "w-max" : "flex grow flex-col",
          contentContainerClassName,
        )}
        ListHeaderComponent={classedSlot(
          ListHeaderComponent,
          ListHeaderComponentClassName,
        )}
        ListFooterComponent={classedSlot(
          ListFooterComponent,
          ListFooterComponentClassName,
        )}
        renderItem={(item) =>
          renderItem && <View data-index={item.index}>{renderItem(item)}</View>
        }
        {...props}
      />
    </Frozen>
  );
}
