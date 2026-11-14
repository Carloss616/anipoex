import { HStack, Section, Spacer, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { Memo, useValue } from "@legendapp/state/react";
import { Text } from "@/components/native/swift-ui/text";
import { Progress } from "@/components/ui/progress";
import { useThemeColor } from "@/hooks/use-theme-color";
import { figures } from "../../utils/overview";
import type { OverviewProps } from "./overview";

/** The Now section: the Reading scan's tally, or how many rescans run. */
export function Overview({ modifiers }: OverviewProps) {
  const reading = useValue(figures.reading);
  const success = useThemeColor("success");

  if (!reading)
    return (
      <Section title="Now" modifiers={modifiers}>
        <VStack alignment="leading" spacing={2}>
          <Memo>
            {() => {
              const n = figures.scans();
              return <Text>{`${n} scan${n === 1 ? "" : "s"} running`}</Text>;
            }}
          </Memo>
          <Text
            textStyle="subheadline"
            modifiers={[foregroundStyle("secondary")]}
          >
            Started from each manga's sources
          </Text>
        </VStack>
      </Section>
    );

  return (
    <Section title="Now" modifiers={modifiers}>
      <VStack alignment="leading" spacing={6}>
        <HStack>
          <Text weight="medium">Reading scan</Text>
          <Spacer />
          <Memo>
            {() => (
              <Text
                textStyle="subheadline"
                modifiers={[foregroundStyle("secondary")]}
              >
                {figures.since()}
              </Text>
            )}
          </Memo>
        </HStack>
        <Memo>
          {() => <Text>{`${figures.done()} of ${figures.total()} manga`}</Text>}
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
      </VStack>
      <Stat
        label="With new chapters"
        figure={figures.withNew}
        color={success}
      />
      <Stat label="Sources skipped" figure={figures.skipped} />
      <Stat label="Left" figure={figures.left} />
    </Section>
  );
}

function Stat({
  label,
  figure,
  color,
}: {
  label: string;
  figure: () => number;
  color?: string;
}) {
  return (
    <HStack>
      <Text>{label}</Text>
      <Spacer />
      <Memo>
        {() => (
          <Text modifiers={[foregroundStyle(color ?? "secondary")]}>
            {String(figure())}
          </Text>
        )}
      </Memo>
    </HStack>
  );
}
