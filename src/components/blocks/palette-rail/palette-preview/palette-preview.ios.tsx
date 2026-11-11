import {
  Capsule,
  Circle,
  HStack,
  Spacer,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  background,
  clipShape,
  foregroundStyle,
  frame,
  glassEffect,
  offset,
  onTapGesture,
  opacity,
  padding,
  shapes,
  strokeBorder,
} from "@expo/ui/swift-ui/modifiers";
import { Icon, Icons } from "@/components/ui/icon";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { PalettePreviewProps } from "./palette-preview";

const WIDTH = 120;
const COVER = 44;
const META = WIDTH - 16 - COVER - 6;
const TAGS = [26, 32, 22];

/** A manga detail page in miniature, in the colors of its `ScopedTheme`. */
export function PalettePreview({
  selected = false,
  onSelect = () => {},
}: PalettePreviewProps) {
  const [
    bg,
    fg,
    overlay,
    muted,
    surfaceSecondary,
    primary,
    accent,
    accentForeground,
  ] = useThemeColor([
    "background",
    "foreground",
    "overlay",
    "muted",
    "surface-secondary",
    "primary",
    "accent",
    "accent-foreground",
  ]);
  const bar = (width: number, alpha: number, height = 5) => (
    <Capsule
      modifiers={[
        frame({ width, height }),
        foregroundStyle(fg),
        opacity(alpha),
      ]}
    />
  );

  return (
    <ZStack alignment="topTrailing">
      <VStack
        alignment="leading"
        spacing={7}
        modifiers={[
          padding({ all: 8 }),
          frame({ width: WIDTH }),
          glassEffect({
            glass: {
              variant: "regular",
              interactive: !selected,
              tint: bg,
            },
            shape: "roundedRectangle",
            cornerRadius: 18,
          }),
          strokeBorder({
            content: selected ? primary : undefined,
            style: { lineWidth: selected ? 3 : 0 },
            shape: "roundedRectangle",
            cornerRadius: 18,
          }),
          ...(selected ? [] : [onTapGesture(onSelect)]),
        ]}
      >
        <HStack alignment="bottom" spacing={6}>
          <ZStack
            modifiers={[
              frame({ width: COVER, height: COVER * 1.5 }),
              background(accent),
              clipShape("roundedRectangle", 8),
            ]}
          >
            <Icon name={Icons.cover} size={14} color={accentForeground} />
          </ZStack>
          <VStack alignment="leading" spacing={4}>
            {bar(META, 0.85)}
            {bar(META * 0.7, 0.65)}
            {bar(META / 2, 0.45)}
          </VStack>
        </HStack>
        <HStack spacing={4}>
          {TAGS.map((width) => (
            <Capsule
              key={width}
              modifiers={[frame({ width, height: 11 }), foregroundStyle(muted)]}
            />
          ))}
        </HStack>
        <VStack
          spacing={5}
          modifiers={[
            padding({ all: 7 }),
            background(muted, shapes.roundedRectangle({ cornerRadius: 10 })),
          ]}
        >
          <HStack>
            <Capsule
              modifiers={[
                frame({ width: 34, height: 5 }),
                foregroundStyle(primary),
              ]}
            />
            <Spacer />
            {bar(18, 0.45)}
          </HStack>
          <ZStack alignment="leading">
            <Capsule
              modifiers={[frame({ height: 3 }), foregroundStyle(muted)]}
            />
            <Capsule
              modifiers={[
                frame({ width: (WIDTH - 30) * 0.62, height: 3 }),
                foregroundStyle(primary),
              ]}
            />
          </ZStack>
        </VStack>
        <VStack
          spacing={1}
          modifiers={[
            background(surfaceSecondary),
            clipShape("roundedRectangle", 8),
          ]}
        >
          {[true, false].map((latest) => (
            <HStack
              key={String(latest)}
              spacing={5}
              modifiers={[
                frame({ height: 15 }),
                padding({ horizontal: 6 }),
                frame({
                  maxWidth: Number.POSITIVE_INFINITY,
                  alignment: "leading",
                }),
                background(overlay),
              ]}
            >
              <Circle
                modifiers={[
                  frame({ width: 5, height: 5 }),
                  foregroundStyle(latest ? primary : "#00000000"),
                ]}
              />
              {bar(45, 0.6, 4)}
            </HStack>
          ))}
        </VStack>
      </VStack>
      {selected && (
        <ZStack
          modifiers={[
            frame({ width: 22, height: 22 }),
            background(primary, shapes.circle()),
            offset({ x: -8, y: 8 }),
          ]}
        >
          <Icon name={Icons.check} size={11} color={bg} />
        </ZStack>
      )}
    </ZStack>
  );
}
