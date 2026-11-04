import { Button, HStack, Spacer, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  foregroundStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useState } from "react";
import { Code, Text } from "@/components/native/swift-ui/text";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { TrackingSheet } from "../tracking-sheet";
import { useTrackingSummary } from "./hooks/use-tracking-summary";

/** A glass button summing the entry up, or inviting one; the sheet edits it. */
export function Tracking({ manga }: { manga: MangaDetail }) {
  const [isPresented, setIsPresented] = useState(false);
  const { tracking, label, total, progress, percent } =
    useTrackingSummary(manga);
  const fgPrimary = foregroundStyle("primary");

  return (
    <>
      <Button
        onPress={() => setIsPresented(true)}
        modifiers={[buttonStyle("glass")]}
      >
        {label ? (
          <VStack
            alignment="leading"
            spacing={8}
            modifiers={[padding({ all: 16 })]}
          >
            <HStack spacing={8}>
              <Text modifiers={[fgPrimary]}>{label}</Text>
              <Spacer />
              <Code modifiers={[fgPrimary]}>
                {progress}
                {!!total && `/${total}`}
              </Code>
              {!!total && (
                <Text
                  textStyle="caption"
                  modifiers={[foregroundStyle("secondary")]}
                >
                  {percent}%
                </Text>
              )}
              <Icon
                name={Icons.chevronRight}
                size={BUTTON_ICON_SIZE}
                color="inherit"
              />
            </HStack>
            {!!total && <Progress value={percent} />}
          </VStack>
        ) : (
          <HStack spacing={8} modifiers={[padding({ all: 16 })]}>
            <Text modifiers={[fgPrimary]}>Add to list</Text>
            <Spacer />
            <Icon name={Icons.add} size={BUTTON_ICON_SIZE} color="inherit" />
          </HStack>
        )}
      </Button>

      <TrackingSheet
        isPresented={isPresented}
        manga={manga}
        tracking={tracking}
        onDismiss={() => setIsPresented(false)}
      />
    </>
  );
}
