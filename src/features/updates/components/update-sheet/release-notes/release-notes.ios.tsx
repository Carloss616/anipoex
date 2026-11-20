// biome-ignore lint/style/noRestrictedImports: a nested span takes its own font, which the house Text always sets
import { HStack, Text as Span, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle, padding } from "@expo/ui/swift-ui/modifiers";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { type Block, parseNotes } from "../../../utils/release-notes";
import type { ReleaseNotesProps } from "./release-notes";

/** A release's Markdown notes as SwiftUI text: headings, bullets, bold. */
export function ReleaseNotes({ markdown }: ReleaseNotesProps) {
  const tint = useThemeColor("primary");
  const bold = useFont("subheadline", "bold");

  const line = ({ spans }: Block) =>
    spans.map((span, j) =>
      span.bold ? (
        // biome-ignore lint/suspicious/noArrayIndexKey: the spans never move.
        <Span key={j} modifiers={[bold]}>
          {span.text}
        </Span>
      ) : (
        span.text
      ),
    );

  return (
    <VStack alignment="leading" spacing={6}>
      {parseNotes(markdown).map((block, i) =>
        block.kind === "heading" ? (
          <Text
            // biome-ignore lint/suspicious/noArrayIndexKey: the lines never move.
            key={i}
            textStyle="headline"
            // A heading after a list stands apart from it.
            modifiers={[
              foregroundStyle(tint),
              ...(i > 0 ? [padding({ top: 10 })] : []),
            ]}
          >
            {line(block)}
          </Text>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: same as above.
          <HStack key={i} alignment="top" spacing={8}>
            {block.kind === "bullet" ? (
              <Text textStyle="subheadline">•</Text>
            ) : null}
            <Text textStyle="subheadline">{line(block)}</Text>
          </HStack>
        ),
      )}
    </VStack>
  );
}
