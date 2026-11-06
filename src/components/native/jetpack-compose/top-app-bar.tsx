import type { ViewEvent } from "@expo/ui/jetpack-compose";
import {
  createViewModifierEventListener,
  type ModifierConfig,
} from "@expo/ui/jetpack-compose/modifiers";
import { requireNativeView } from "expo";
import type { ReactNode } from "react";
import type { ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFontFamily } from "@/hooks/use-font";

export interface TopAppBarProps {
  title?: string;
  /** Turns the bar into a search app bar; the field filters in place. */
  search?: {
    placeholder?: string;
    /** The field's text: a new one rewrites it, and closing returns to it. */
    text?: string;
    onChangeText: (text: string) => void;
    /** Fires on the keyboard's search key, with the field's text. */
    onSubmit?: (text: string) => void;
    /** Empties the field after a submit, for a search that opens results. */
    clearOnSubmit?: boolean;
  };
  /** Before any scroll; the theme's surface when omitted. */
  containerColor?: ColorValue;
  /**
   * `enterAlways`: the bar and tabs leave as the content scrolls down and
   * return on the way up. M3's `TopAppBarDefaults` names.
   * @default "pinned"
   */
  scrollBehavior?: "pinned" | "enterAlways";
  /** Scrollable tabs under the bar; each content child becomes a page. */
  tabs?: { title: string; count?: number }[];
  /** The page to show; changing it scrolls the pager. */
  page?: number;
  /** Fires once the pager settles on a page, by swipe or tab tap. */
  onPageChange?: (index: number) => void;
  /** Start offset of the scrollable tabs, in dp. M3 asks for 52. */
  tabsEdgePadding?: number;
  modifiers?: ModifierConfig[];
  /** `TopAppBar.NavigationIcon`, `TopAppBar.Title`, `TopAppBar.Actions`, then the content or pages. */
  children?: ReactNode;
}

type NativeProps = Omit<TopAppBarProps, "search" | "onPageChange"> & {
  search?: {
    placeholder?: string;
    text?: string;
    clearOnSubmit?: boolean;
  };
  fontFamily?: string;
  tabFontFamily?: string;
  topInset?: number;
} & ViewEvent<"onSearchTextChange", { text: string }> &
  ViewEvent<"onSearchSubmit", { text: string }> &
  ViewEvent<"onPageChange", { index: number }>;

const NativeAppBar = requireNativeView<NativeProps>(
  "TopAppBar",
  "TopAppBarView",
);
// @expo/ui's own slot marker, which it doesn't export.
const SlotView = requireNativeView<{ slotName: string; children: ReactNode }>(
  "ExpoUI",
  "SlotView",
);

/**
 * M3 top app bar from the local `modules/top-app-bar`: small with a title, or a search
 * app bar, with optional tabs. Must sit inside a Host. With content children,
 * it fills its Host and the content scrolls under the bar's own tree, which is
 * what lets `scrollBehavior="enterAlways"` work.
 */
export function TopAppBar({
  search,
  onPageChange,
  modifiers,
  ...props
}: TopAppBarProps) {
  const fontFamily = useFontFamily("normal");
  // M3 sets tab labels in medium.
  const tabFontFamily = useFontFamily("medium");
  // The bar runs under the status bar; Compose in a Host doesn't see the inset.
  const { top } = useSafeAreaInsets();

  return (
    <NativeAppBar
      {...props}
      search={
        search && {
          placeholder: search.placeholder,
          text: search.text,
          clearOnSubmit: search.clearOnSubmit,
        }
      }
      fontFamily={fontFamily}
      tabFontFamily={tabFontFamily}
      topInset={top}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      onSearchTextChange={({ nativeEvent }) =>
        search?.onChangeText(nativeEvent.text)
      }
      onSearchSubmit={({ nativeEvent }) => search?.onSubmit?.(nativeEvent.text)}
      onPageChange={({ nativeEvent }) => onPageChange?.(nativeEvent.index)}
    />
  );
}

TopAppBar.NavigationIcon = function NavigationIcon({
  children,
}: {
  children: ReactNode;
}) {
  return <SlotView slotName="navigationIcon">{children}</SlotView>;
};

/** A title of the screen's own, in Compose, in place of `title`. */
TopAppBar.Title = function Title({ children }: { children: ReactNode }) {
  return <SlotView slotName="title">{children}</SlotView>;
};

TopAppBar.Actions = function Actions({ children }: { children: ReactNode }) {
  return <SlotView slotName="actions">{children}</SlotView>;
};
