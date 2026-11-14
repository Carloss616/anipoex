import { Box, Column } from "@expo/ui/jetpack-compose";
import { padding } from "@expo/ui/jetpack-compose/modifiers";
import { Computed, Memo, useValue } from "@legendapp/state/react";
import type { ReactNode } from "react";
import { GUTTER } from "@/components/native/constants";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Progress } from "@/components/ui/progress";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { figures } from "../../utils/overview";
import type { OverviewProps } from "./overview";

/** The Reading scan's tally, or how many rescans run outside it. */
export function Overview(_: OverviewProps) {
  const reading = useValue(figures.reading);
  const m3 = useThemeM3Colors();

  if (!reading)
    return (
      <Rows>
        <OverviewRow index={0} count={1}>
          <Memo>
            {() => {
              const n = figures.scans();
              return <Text>{`${n} scan${n === 1 ? "" : "s"} running`}</Text>;
            }}
          </Memo>
          <SegmentedListItem.Supporting>
            <Text style={{ typography: "bodyMedium" }}>
              Started from each manga's sources
            </Text>
          </SegmentedListItem.Supporting>
        </OverviewRow>
      </Rows>
    );

  return (
    <Rows>
      <OverviewRow index={0} count={2}>
        <Memo>
          {() => <Text>{`${figures.done()} of ${figures.total()} manga`}</Text>}
        </Memo>
        <SegmentedListItem.Supporting>
          <Column>
            <Memo>
              {() => (
                <Text style={{ typography: "bodyMedium" }}>
                  {`Reading scan · ${figures.since()}`}
                </Text>
              )}
            </Memo>
            <Memo>
              {() => (
                <Progress
                  value={figures.done()}
                  maxValue={Math.max(1, figures.total())}
                  size="sm"
                />
              )}
            </Memo>
          </Column>
        </SegmentedListItem.Supporting>
      </OverviewRow>
      <Stat
        label="With new chapters"
        figure={figures.withNew}
        color={m3.primary}
      />
      <Stat label="Sources skipped" figure={figures.skipped} />
      <Stat label="Left" figure={figures.left} last />
    </Rows>
  );
}

function Rows({ children }: { children: ReactNode }) {
  return (
    <Column modifiers={[padding(GUTTER, 0, GUTTER, 0)]}>{children}</Column>
  );
}

function OverviewRow({
  index,
  count,
  children,
}: {
  index: number;
  count: number;
  children: ReactNode;
}) {
  const m3 = useThemeM3Colors();

  return (
    <Box modifiers={[padding(0, index > 0 ? SEGMENTED_GAP : 0, 0, 0)]}>
      <SegmentedListItem
        index={index}
        count={count}
        colors={{ containerColor: m3.surfaceContainerHigh }}
      >
        {children}
      </SegmentedListItem>
    </Box>
  );
}

function Stat({
  label,
  figure,
  color,
  last,
}: {
  label: string;
  figure: () => number;
  color?: string;
  last?: boolean;
}) {
  return (
    <OverviewRow index={1} count={last ? 2 : 3}>
      <Text>{label}</Text>
      <SegmentedListItem.Trailing>
        <Computed>
          {() => (
            <Text style={{ typography: "titleMedium" }} color={color}>
              {String(figure())}
            </Text>
          )}
        </Computed>
      </SegmentedListItem.Trailing>
    </OverviewRow>
  );
}
