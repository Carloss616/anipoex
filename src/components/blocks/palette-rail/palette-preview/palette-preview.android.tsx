import { Box, Column, Row } from "@expo/ui/jetpack-compose";
import {
  align,
  alpha,
  background,
  clip,
  fillMaxWidth,
  height,
  offset,
  padding,
  Shapes,
  size,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { Icon, Icons } from "@/components/ui/icon";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { PalettePreviewProps } from "./palette-preview";

const WIDTH = 120;
const COVER = 44;
const META = WIDTH - 16 - COVER - 6;
const TAGS = [26, 32, 22];
const pill = Shapes.RoundedCorner(3);

/**
 * A manga detail page in miniature, in the M3 colors of its `ScopedTheme`.
 * The chosen card's corners switch from 18 to 28 at once: `@expo/ui` can't
 * animate a shape.
 */
export function PalettePreview({ selected }: PalettePreviewProps) {
  const m3 = useThemeM3Colors();
  const radius = selected ? 28 : 18;
  const edge = selected ? 3 : 1;
  const bar = (barWidth: number, color: string, opacity = 1) => (
    <Box
      modifiers={[
        size(barWidth, 5),
        clip(pill),
        background(color),
        alpha(opacity),
      ]}
    />
  );

  return (
    <Box>
      {/* The edge is the outer box showing around the inner one. */}
      <Box
        modifiers={[
          width(WIDTH),
          clip(Shapes.RoundedCorner(radius)),
          background(selected ? m3.primary : m3.outlineVariant),
          padding(edge, edge, edge, edge),
        ]}
      >
        <Column
          verticalArrangement={{ spacedBy: 7 }}
          modifiers={[
            fillMaxWidth(),
            clip(Shapes.RoundedCorner(radius - edge)),
            background(m3.surface),
            padding(8 - edge, 8 - edge, 8 - edge, 8 - edge),
          ]}
        >
          <Row
            verticalAlignment="bottom"
            horizontalArrangement={{ spacedBy: 6 }}
          >
            <Box
              contentAlignment="center"
              modifiers={[
                size(COVER, COVER * 1.5),
                clip(Shapes.RoundedCorner(10)),
                background(m3.surfaceContainerHighest),
              ]}
            >
              <Icon name={Icons.cover} size={14} muted />
            </Box>
            <Column
              verticalArrangement={{ spacedBy: 4 }}
              modifiers={[padding(0, 0, 0, 2)]}
            >
              {bar(META, m3.onSurface, 0.85)}
              {bar(META * 0.7, m3.onSurface, 0.85)}
              {bar(META / 2, m3.onSurfaceVariant)}
            </Column>
          </Row>
          <Row horizontalArrangement={{ spacedBy: 4 }}>
            {TAGS.map((tag) => (
              <Box
                key={tag}
                modifiers={[
                  size(tag, 11),
                  clip(Shapes.RoundedCorner(6)),
                  background(m3.secondaryContainer),
                ]}
              />
            ))}
          </Row>
          <Column
            verticalArrangement={{ spacedBy: 5 }}
            modifiers={[
              fillMaxWidth(),
              clip(Shapes.RoundedCorner(12)),
              background(m3.surfaceContainerHigh),
              padding(7, 7, 7, 7),
            ]}
          >
            <Row
              horizontalArrangement="spaceBetween"
              modifiers={[fillMaxWidth()]}
            >
              {bar(34, m3.onSurface)}
              {bar(18, m3.onSurfaceVariant)}
            </Row>
            <Box
              modifiers={[
                fillMaxWidth(),
                height(3),
                clip(pill),
                background(m3.surfaceContainerHighest),
              ]}
            >
              <Box
                modifiers={[
                  fillMaxWidth(0.62),
                  height(3),
                  background(m3.primary),
                ]}
              />
            </Box>
          </Column>
          <Column verticalArrangement={{ spacedBy: 2 }}>
            {[true, false].map((latest) => (
              <Row
                key={String(latest)}
                verticalAlignment="center"
                horizontalArrangement={{ spacedBy: 5 }}
                modifiers={[
                  fillMaxWidth(),
                  height(15),
                  clip(
                    Shapes.RoundedCorner(
                      latest
                        ? {
                            topStart: 8,
                            topEnd: 8,
                            bottomStart: 3,
                            bottomEnd: 3,
                          }
                        : {
                            topStart: 3,
                            topEnd: 3,
                            bottomStart: 8,
                            bottomEnd: 8,
                          },
                    ),
                  ),
                  background(m3.surfaceContainerLow),
                  padding(6, 0, 6, 0),
                ]}
              >
                <Box
                  modifiers={[
                    size(5, 5),
                    clip(Shapes.Circle),
                    background(latest ? m3.primary : m3.surfaceContainerLow),
                  ]}
                />
                <Box
                  modifiers={[
                    size(45, 4),
                    clip(pill),
                    background(m3.onSurface),
                    alpha(0.6),
                  ]}
                />
              </Row>
            ))}
          </Column>
        </Column>
      </Box>
      {selected && (
        <Box
          contentAlignment="center"
          modifiers={[
            align("topEnd"),
            offset(7, -7),
            size(22, 22),
            clip(Shapes.Circle),
            background(m3.primary),
          ]}
        >
          <Icon name={Icons.check} size={14} color={m3.onPrimary} />
        </Box>
      )}
    </Box>
  );
}
