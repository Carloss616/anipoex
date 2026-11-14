import { Memo, useValue } from "@legendapp/state/react";
import { Typography } from "panelui-native/components/typography";
import { Frame } from "panelui-web/frame";
import { View } from "react-native";
import { Progress } from "@/components/ui/progress";
import { figures } from "../../utils/overview";

/** The Reading scan's tally, or how many rescans run outside it. */
export function Overview() {
  const reading = useValue(figures.reading);

  if (!reading)
    return (
      <Frame>
        <Frame.Header>
          <Frame.Title>
            <Memo>
              {() => {
                const n = figures.scans();
                return `${n} scan${n === 1 ? "" : "s"} running`;
              }}
            </Memo>
          </Frame.Title>
          <Frame.Description>
            Started from each manga's sources
          </Frame.Description>
        </Frame.Header>
      </Frame>
    );

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>Reading scan</Frame.Title>
        <Frame.Description>
          <Memo>{figures.since}</Memo>
        </Frame.Description>
      </Frame.Header>
      <View className="gap-3 px-4 pb-4">
        <Typography type="h3">
          <Memo>{figures.done}</Memo>
          <Typography type="body-sm" muted>
            {" of "}
            <Memo>{figures.total}</Memo>
            {" manga"}
          </Typography>
        </Typography>
        <Memo>
          {() => (
            <Progress
              aria-label="Manga done"
              value={figures.done()}
              maxValue={Math.max(1, figures.total())}
              size="sm"
            />
          )}
        </Memo>
        <View className="flex-row gap-2">
          <Stat figure={figures.withNew} label="with new chapters" success />
          <Stat figure={figures.skipped} label="sources skipped" />
          <Stat figure={figures.left} label="left" />
        </View>
      </View>
    </Frame>
  );
}

function Stat({
  figure,
  label,
  success,
}: {
  figure: () => number;
  label: string;
  success?: boolean;
}) {
  return (
    <View className="flex-1 rounded-lg border px-2.5 py-2">
      <Typography type="large" className={success ? "text-success" : undefined}>
        <Memo>{figure}</Memo>
      </Typography>
      <Typography type="body-xs" muted>
        {label}
      </Typography>
    </View>
  );
}
