import { Button, HStack, Spacer, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  foregroundStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useState } from "react";
import { Code, Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { useThemeColor } from "@/hooks/use-theme-color";
import { TrackingSheet } from "../tracking-sheet";
import { useTrackingSummary } from "./hooks/use-tracking-summary";

/** A glass button summing the entry up; the sheet edits it. */
export function Tracking({ manga }: { manga: MangaDetail }) {
  const [isPresented, setIsPresented] = useState(false);
  const { tracking, label, total, progress, percent } =
    useTrackingSummary(manga);
  const foreground = useThemeColor("foreground");

  return (
    <>
      <Button
        onPress={() => setIsPresented(true)}
        modifiers={[buttonStyle("glass")]}
      >
        <VStack
          alignment="leading"
          spacing={8}
          modifiers={[padding({ vertical: 16 })]}
        >
          <HStack spacing={8}>
            <Badge color={label ? "primary" : "secondary"} />
            {/* The status and count read as text; only the chevron wears the tint. */}
            <Text modifiers={[foregroundStyle(foreground)]}>
              {label ?? "Not in list"}
            </Text>
            <Spacer />
            <Code modifiers={[foregroundStyle(foreground)]}>
              {progress}/{total ?? "_"}
            </Code>
            {!!total && (
              <Text
                textStyle="caption"
                modifiers={[foregroundStyle("secondary")]}
              >
                {percent}%
              </Text>
            )}
            <Icon name={Icons.chevronRight} size={18} color="inherit" />
          </HStack>
          <Progress value={percent} />
        </VStack>
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
