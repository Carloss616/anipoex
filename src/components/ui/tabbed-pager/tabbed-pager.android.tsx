import type { ViewEvent } from "@expo/ui/jetpack-compose";
import { createViewModifierEventListener } from "@expo/ui/jetpack-compose/modifiers";
import { requireNativeView } from "expo";
import type { TabbedPagerProps } from "./tabbed-pager";

type NativeProps = Omit<TabbedPagerProps, "onPageChange"> &
  ViewEvent<"onPageChange", { index: number }>;

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
  ...props
}: TabbedPagerProps) {
  return (
    <NativeTabbedPager
      {...props}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      onPageChange={({ nativeEvent }) => onPageChange(nativeEvent.index)}
    />
  );
}
