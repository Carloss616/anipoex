import { useValue } from "@legendapp/state/react";
import { cn } from "panelui-native/utils/cn";
import { memo, useEffect, useRef } from "react";
import { View, type ViewStyle } from "react-native";
import {
  LegendList,
  type LegendListRef,
} from "@/components/layout/legend-list";
import { Badge } from "@/components/ui/badge";
import { SourceTile } from "@/features/manga/components/source-tile";
import type { ActiveMark } from "@/features/manga/state/active-scans";
import { sourceColor } from "@/features/manga/utils/source";
import { themeMode$ } from "@/state/theme";
import { DIM, markLabel } from "./utils";

const FADE =
  "linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)";
const MARK_SIZE = 40;

/**
 * The sources in one row, in the order given; it scrolls itself to the first
 * one scanning, the end of what's done. Native shows the first few and a count.
 */
export interface MarkRailProps {
  marks: ActiveMark[];
}

export function MarkRail({ marks }: MarkRailProps) {
  const list = useRef<LegendListRef>(null);
  const focus = marks.findIndex((mark) => mark.state === "scanning");
  useEffect(() => {
    if (focus >= 0)
      void list.current?.scrollToIndex({ index: focus, viewPosition: 0.5 });
  }, [focus]);

  return (
    <LegendList
      ref={list}
      horizontal
      data={marks}
      keyExtractor={(mark) => mark.id}
      estimatedItemSize={MARK_SIZE}
      recycleItems
      columnWrapperStyle={{ gap: 8 }}
      // The last tile keeps the gap after it: the same 8 at the start.
      contentContainerClassName="ps-2"
      // The indicator prop does nothing on web, and the badges' overhang
      // would let the row scroll up and down.
      style={
        {
          minWidth: 0,
          minHeight: MARK_SIZE + 4,
          scrollbarWidth: "none",
          overflowY: "hidden",
          // Fades the edges, so the row shows it scrolls.
          maskImage: FADE,
          WebkitMaskImage: FADE,
        } as ViewStyle
      }
      renderItem={({ item }) => (
        // Room for the +N badge to hang into: the list's cells clip their
        // paint, and the gap only pads their end.
        <View className="pb-1">
          <MarkTile mark={item} />
        </View>
      )}
    />
  );
}

/** A source's tile in its scan state; reads the theme so the row doesn't. */
const MarkTile = memo(function MarkTile({ mark }: { mark: ActiveMark }) {
  const mode = useValue(themeMode$);
  const { state, unread } = mark;
  return (
    <View
      role="img"
      accessibilityLabel={markLabel(mark)}
      className={cn(DIM.has(state) && "opacity-40")}
    >
      <SourceTile
        initials={mark.initials}
        iconUrl={mark.iconUrl}
        color={sourceColor(mark, mode)}
        loading={state === "scanning"}
      />
      {state === "found" && !!unread && (
        <Badge color="success" solid className="absolute -inset-e-1 -bottom-1">
          {`+${unread}`}
        </Badge>
      )}
      {state === "error" && (
        <Badge
          color="destructive"
          className="absolute -inset-e-0.5 -bottom-0.5"
        />
      )}
    </View>
  );
});
