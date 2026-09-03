import { cn } from "panelui-native/utils/cn";
import { Platform, RefreshControl, ScrollView } from "react-native";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { useMaxHeaderHeight } from "@/hooks/use-max-header-height";
import { useRefreshControlTheme } from "@/hooks/use-theme";

export interface RefreshScrollViewProps {
  children?: React.ReactNode;
  className?: string;
  refreshing: boolean;
  onRefresh: () => void;
}

/**
 * A pull-to-refresh scroller for a screen made of native views. Neither native
 * toolkit can drive it from inside: SwiftUI only draws the `refreshable`
 * indicator on a `List`, never on its `ScrollView`. So the scrolling and the
 * spinner stay in React Native, and the host measures the native content —
 * the web renders straight into the DOM and needs no host of its own.
 */
export function RefreshScrollView({
  children,
  className,
  refreshing,
  onRefresh,
}: RefreshScrollViewProps) {
  const refreshControlTheme = useRefreshControlTheme();
  const headerScroll = useHeaderScroll();
  const maxHeaderHeight = useMaxHeaderHeight();

  return (
    <ScrollView
      className={cn("flex-1", className)}
      {...headerScroll}
      refreshControl={
        <RefreshControl
          // Only Android; on iOS when `headerTransparent` is set, the header is not positioned absolutely
          progressViewOffset={Platform.OS === "android" ? maxHeaderHeight : 0}
          refreshing={refreshing}
          onRefresh={onRefresh}
          {...refreshControlTheme}
        />
      }
    >
      {children}
    </ScrollView>
  );
}
