import { View } from "react-native";
import { RefreshScrollView } from "@/components/layout/refresh-scroll-view";
import { Host } from "@/components/ui/host";
import { ART_HEIGHT } from "../hero";

export interface DetailScrollProps {
  /** RN art drawn behind the header; the content overlaps its last `ART_HEIGHT`. */
  hero: React.ReactElement;
  /** Native content, laid out in a Host. */
  children: React.ReactNode;
  refreshing: boolean;
  onRefresh: () => Promise<unknown> | undefined;
  className?: string;
}

export function DetailScroll({
  hero,
  children,
  refreshing,
  onRefresh,
  className,
}: DetailScrollProps) {
  return (
    <RefreshScrollView
      className={className}
      refreshing={refreshing}
      onRefresh={() => void onRefresh()}
    >
      <View style={{ marginBottom: -ART_HEIGHT }}>{hero}</View>
      <Host matchContents={{ vertical: true }} className="w-full">
        {children}
      </Host>
    </RefreshScrollView>
  );
}
