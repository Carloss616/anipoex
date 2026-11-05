import { Box, Column, Row } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  padding,
  Shapes,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { GUTTER } from "@/components/native/constants";
import { SectionHeader } from "@/components/native/jetpack-compose/section-header";
import { SECTIONS } from "@/features/home/constants";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { SectionPlaceholderProps } from "./section-placeholder";

/** Covers-to-be while the sections load. */
export function SectionPlaceholder({ id }: SectionPlaceholderProps) {
  const m3 = useThemeM3Colors();

  return (
    <Column>
      <SectionHeader title={SECTIONS[id].title} />
      <Row
        horizontalArrangement={{ spacedBy: 8 }}
        modifiers={[padding(GUTTER, 0, GUTTER, 0)]}
      >
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            modifiers={[
              size(112, 168),
              clip(Shapes.RoundedCorner(20)),
              background(m3.surfaceContainer),
            ]}
          />
        ))}
      </Row>
    </Column>
  );
}
