import { Box, PullToRefreshBox } from "@expo/ui/jetpack-compose";
import {
  fillMaxSize,
  fillMaxWidth,
  offset,
  padding,
} from "@expo/ui/jetpack-compose/modifiers";
import { cn } from "panelui-native/utils/cn";
import { Column } from "@/components/layout/column";
import { LazyColumn } from "@/components/layout/lazy-column";
import { Host, RNHostView } from "@/components/ui/host";
import { useMaxHeaderHeight } from "@/hooks/use-max-header-height";
import type { DetailScrollProps } from "./detail-scroll";

/** Compose scroller; the header is transparent, so the hero starts at the top. */
export function DetailScroll({
  hero,
  children,
  refreshing,
  onRefresh,
  className,
}: DetailScrollProps) {
  const maxHeaderHeight = useMaxHeaderHeight();

  return (
    <Host className={cn("flex-1", className)}>
      <PullToRefreshBox
        isRefreshing={refreshing}
        onRefresh={() => void onRefresh()}
        contentAlignment="topCenter"
        // Below the header, not under it.
        indicator={{ modifiers: [offset(0, maxHeaderHeight)] }}
        modifiers={[fillMaxSize()]}
      >
        <LazyColumn modifiers={[fillMaxSize()]}>
          {/* Compose has no negative padding: the content is stacked over the
              hero and starts below the header, covering the art's last stretch. */}
          <Box modifiers={[fillMaxWidth()]}>
            <RNHostView matchContents={{ vertical: true }} className="w-full">
              {hero}
            </RNHostView>
            <Column modifiers={[padding(0, maxHeaderHeight, 0, 0)]}>
              {children}
            </Column>
          </Box>
        </LazyColumn>
      </PullToRefreshBox>
    </Host>
  );
}
