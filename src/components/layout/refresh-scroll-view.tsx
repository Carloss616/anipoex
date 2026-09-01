import { cn } from "panelui-native/utils/cn";
import { Platform, RefreshControl, ScrollView } from "react-native";
import { Host } from "@/components/ui/host";
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

  return (
    <ScrollView
      className={cn("flex-1", className)}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          {...refreshControlTheme}
        />
      }
    >
      {Platform.OS === "web" ? (
        children
      ) : (
        <Host matchContents={{ vertical: true }} className="w-full">
          {children}
        </Host>
      )}
    </ScrollView>
  );
}
