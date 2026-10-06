import { ScrollView } from "@expo/ui/swift-ui";
import {
  padding,
  refreshable,
  scrollClipDisabled,
} from "@expo/ui/swift-ui/modifiers";
import { cn } from "panelui-native/utils/cn";
import { Column } from "@/components/layout/column";
import { Host, RNHostView } from "@/components/ui/host";
import { useMaxHeaderHeight } from "@/hooks/use-max-header-height";
import { ART_HEIGHT } from "../hero";
import type { DetailScrollProps } from "./detail-scroll";

/**
 * The scroller runs under the header (`scrollClipDisabled`), and the content is
 * pulled up by the header height so the hero sits behind it, as the RN one did.
 */
export function DetailScroll({
  hero,
  children,
  onRefresh,
  className,
}: DetailScrollProps) {
  const maxHeaderHeight = useMaxHeaderHeight();

  return (
    <Host className={cn("flex-1", className)}>
      <ScrollView
        modifiers={[
          scrollClipDisabled(),
          refreshable(async () => {
            await onRefresh();
          }),
        ]}
      >
        <Column modifiers={[padding({ top: -maxHeaderHeight })]}>
          <RNHostView matchContents={{ vertical: true }} className="w-full">
            {hero}
          </RNHostView>
          <Column modifiers={[padding({ top: -ART_HEIGHT })]}>
            {children}
          </Column>
        </Column>
      </ScrollView>
    </Host>
  );
}
