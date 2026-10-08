import type { ViewEvent } from "@expo/ui/jetpack-compose";
import { createViewModifierEventListener } from "@expo/ui/jetpack-compose/modifiers";
import { requireNativeView } from "expo";
import { useResolveClassNames } from "uniwind";
import { paddingX } from "@/utils/utils";
import type { TabbedPagerProps } from "./tabbed-pager";

type NativeProps = Omit<TabbedPagerProps, "onPageChange" | "tabsClassName"> & {
  edgePadding?: number;
} & ViewEvent<"onPageChange", { index: number }>;

const NativeTabbedPager = requireNativeView<NativeProps>(
  "TabbedPager",
  "TabbedPagerView",
);

/**
 * M3 scrollable tabs over a pager, from the local `modules/tabbed-pager`. Must
 * sit inside a Host; each child is a page.
 */
export function TabbedPager({
  modifiers,
  onPageChange,
  tabsClassName,
  ...props
}: TabbedPagerProps) {
  const edge = paddingX(useResolveClassNames(tabsClassName ?? ""));

  return (
    <NativeTabbedPager
      {...props}
      edgePadding={tabsClassName ? Math.max(edge.left, edge.right) : undefined}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      onPageChange={({ nativeEvent }) => onPageChange(nativeEvent.index)}
    />
  );
}
