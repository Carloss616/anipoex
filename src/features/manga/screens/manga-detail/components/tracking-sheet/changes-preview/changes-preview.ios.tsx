import { VStack } from "@expo/ui/swift-ui";
import { foregroundStyle, padding } from "@expo/ui/swift-ui/modifiers";
import { Text } from "@/components/native/swift-ui/text";
import { AnimatedVisibility } from "@/components/ui/animated-visibility";
import type { ChangesPreviewProps } from "./changes-preview";

export function ChangesPreview({ changes }: ChangesPreviewProps) {
  return (
    <AnimatedVisibility visible={changes.length > 0}>
      <VStack
        alignment="leading"
        spacing={4}
        modifiers={[padding({ horizontal: 16, bottom: 16 })]}
      >
        {changes.map((line) => (
          <Text
            key={line}
            textStyle="footnote"
            weight="medium"
            modifiers={[foregroundStyle("secondary")]}
          >
            {line}
          </Text>
        ))}
      </VStack>
    </AnimatedVisibility>
  );
}
