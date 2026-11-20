// biome-ignore lint/style/noRestrictedImports: a nested span takes no typography, which the house Text always sets
import { Column, Row, Text as Span } from "@expo/ui/jetpack-compose";
import { padding, weight } from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { useFontFamily } from "@/hooks/use-font";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { type Block, parseNotes } from "../../../utils/release-notes";
import type { ReleaseNotesProps } from "./release-notes";

/** A release's Markdown notes as Compose text: headings, bullets, bold. */
export function ReleaseNotes({ markdown }: ReleaseNotesProps) {
  const m3 = useThemeM3Colors();
  const bold = useFontFamily("bold");

  const line = ({ spans }: Block) =>
    spans.map((span, j) =>
      span.bold ? (
        // biome-ignore lint/suspicious/noArrayIndexKey: the spans never move.
        <Span key={j} style={{ fontFamily: bold }}>
          {span.text}
        </Span>
      ) : (
        span.text
      ),
    );

  return (
    <Column verticalArrangement={{ spacedBy: 6 }}>
      {parseNotes(markdown).map((block, i) =>
        block.kind === "heading" ? (
          <Text
            // biome-ignore lint/suspicious/noArrayIndexKey: the lines never move.
            key={i}
            style={{ typography: "titleSmall" }}
            color={m3.primary}
            // A heading after a list stands apart from it.
            modifiers={i > 0 ? [padding(0, 10, 0, 0)] : undefined}
          >
            {line(block)}
          </Text>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: same as above.
          <Row key={i} horizontalArrangement={{ spacedBy: 8 }}>
            {block.kind === "bullet" ? (
              <Text style={{ typography: "bodyMedium" }} color={m3.onSurface}>
                •
              </Text>
            ) : null}
            <Text
              style={{ typography: "bodyMedium" }}
              color={m3.onSurface}
              modifiers={[weight(1)]}
            >
              {line(block)}
            </Text>
          </Row>
        ),
      )}
    </Column>
  );
}
