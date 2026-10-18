import type { ModifierConfig } from "@expo/ui/jetpack-compose/modifiers";
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

/** Android only (`modules/tabbed-pager`); other platforms pick a list their own way. */
export function TabbedPager(_: TabbedPagerProps): ReactNode {
  return null;
}
