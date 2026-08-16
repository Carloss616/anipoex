import {
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import { height, width } from "@expo/ui/jetpack-compose/modifiers";
import { Memo } from "@legendapp/state/react";
import { useEffect, useMemo, useRef } from "react";
import { ScrollView } from "react-native";
import type { Route } from "react-native-tab-view";
import { Badge } from "@/components/ui/badge";
import { Host } from "@/components/ui/host";
import { Typography } from "@/components/ui/typography";
import type { MediaListStatus } from "@/graphql/types.generated";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Row } from "../row";
import type { TabBarProps } from "./tab-bar";

const CHAR_WIDTH = 7;
const BADGE_WIDTH = 36;
const SEGMENT_INSET = 50;
const MIN_SEGMENT_WIDTH = 96;

/** Material gives the row and each segment a `defaultMinSize`, which only an explicit height beats. */
const SEGMENT_HEIGHT = 40;

/**
 * Android TabBar: M3's segmented button row rather than [the shared
 * tabs](./tab-bar.tsx).
 */
export function TabBar<T extends Route>({
  navigationState: { index, routes },
  counts$,
  jumpTo,
}: TabBarProps<T>) {
  const primary = useThemeColor("primary");
  const m3 = useMaterialColors({ seedColor: primary });
  const scroller = useRef<ScrollView>(null);

  const segmentWidth = useMemo(
    () =>
      Math.max(
        MIN_SEGMENT_WIDTH,
        ...routes.map(
          (r) =>
            (r.title?.length ?? 0) * CHAR_WIDTH + BADGE_WIDTH + SEGMENT_INSET,
        ),
      ),
    [routes],
  );

  useEffect(() => {
    scroller.current?.scrollTo({
      // A little in from the edge, so it does not read as the last one in the row.
      x: Math.max(index * segmentWidth - 24, 0),
      animated: true,
    });
  }, [index, segmentWidth]);

  return (
    <ScrollView
      ref={scroller}
      horizontal
      showsHorizontalScrollIndicator={false}
      className="grow-0"
      contentContainerClassName="gutters px-safe-offset-gx"
    >
      <Host matchContents>
        <SingleChoiceSegmentedButtonRow modifiers={[height(SEGMENT_HEIGHT)]}>
          {routes.map((r, i) => (
            <SegmentedButton
              key={r.key}
              selected={i === index}
              onClick={() => jumpTo(r.key)}
              modifiers={[width(segmentWidth), height(SEGMENT_HEIGHT)]}
              colors={{
                activeContainerColor: m3.secondaryContainer,
                activeContentColor: m3.onSecondaryContainer,
                inactiveContentColor: m3.onSurfaceVariant,
                activeBorderColor: m3.outline,
                inactiveBorderColor: m3.outlineVariant,
              }}
            >
              <SegmentedButton.Label>
                <Row alignment="center" className="gap-2">
                  <Typography type="body-xs" weight="medium">
                    {r.title}
                  </Typography>
                  <Memo>
                    {() => (
                      <Badge>
                        {counts$[r.key as MediaListStatus].get() ?? "~"}
                      </Badge>
                    )}
                  </Memo>
                </Row>
              </SegmentedButton.Label>
            </SegmentedButton>
          ))}
        </SingleChoiceSegmentedButtonRow>
      </Host>
    </ScrollView>
  );
}
