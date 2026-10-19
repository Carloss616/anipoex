import type { ViewEvent } from "@expo/ui/jetpack-compose";
import {
  createViewModifierEventListener,
  type ModifierConfig,
} from "@expo/ui/jetpack-compose/modifiers";
import { requireNativeView } from "expo";
import type { ReactNode } from "react";

export interface TabbedPagerProps {
  tabs: { title: string; count?: number }[];
  /** Scrolling edge padding of the tabs, in dp. Default 16. */
  edgePadding?: number;
  /** The page to show; changing it scrolls the pager. */
  page: number;
  fontFamily?: string;
  /** Fires once the pager settles on a page, by swipe or tab tap. */
  onPageChange: (index: number) => void;
  modifiers?: ModifierConfig[];
  /** One child per tab, in order. */
  children: ReactNode;
}

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
