import { Button, HStack, Section, Spacer, VStack } from "@expo/ui/swift-ui";
import { buttonStyle, foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { Computed } from "@legendapp/state/react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Icon } from "@/components/ui/icon";
import { waitingIds } from "@/features/activity/utils/state";
import { resumeDownloads } from "@/features/downloads";
import { Overview } from "../overview";
import { COPY } from "./constants";
import type { StatusCardProps } from "./status-card";
import { sendingLine } from "./utils";

/** Its own Section, since Overview is one. */
export function StatusCard({ mode, modifiers }: StatusCardProps) {
  if (mode === "reading" || mode === "scans")
    return <Overview modifiers={modifiers} />;

  const { icon, title } = COPY[mode];
  const secondary = [foregroundStyle("secondary")];

  return (
    <Section modifiers={modifiers}>
      <HStack spacing={12} modifiers={ROW_FILL}>
        <Icon name={icon} size={20} />
        <VStack alignment="leading" spacing={2}>
          <Text weight="medium">{title}</Text>
          {mode === "sending" ? (
            <Computed>
              {() => (
                <Text textStyle="subheadline" modifiers={secondary}>
                  {sendingLine(waitingIds())}
                </Text>
              )}
            </Computed>
          ) : (
            <Text textStyle="subheadline" modifiers={secondary}>
              {COPY[mode].description}
            </Text>
          )}
        </VStack>
        <Spacer />
        {mode === "paused" && (
          <Button
            label="Resume"
            modifiers={[buttonStyle("borderless")]}
            onPress={resumeDownloads}
          />
        )}
      </HStack>
    </Section>
  );
}
