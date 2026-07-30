import { Spacer, VStack } from "@expo/ui/swift-ui";
import {
  aspectRatio,
  background,
  clipShape,
  frame,
  glassEffect,
  onTapGesture,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import type {
  CardBodyProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardTitleProps,
} from "heroui-native/card";
import { useThemeColor } from "heroui-native/hooks";
import type { SurfaceVariant } from "heroui-native/surface";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { dp, omitUndefined } from "@/utils/utils";
import type { CardProps } from "./card";
import { Host, useIsInsideHost } from "./host";
import { Typography } from "./typography";

/** Matches heroui's `--radius-3xl` / `p-4` so web and native cards agree. */
const RADIUS = 24;
const PADDING = 16;
const SPACING = 8;

/**
 * Stands in for SwiftUI's `.infinity`: a frame clamps `maxWidth` to whatever
 * the parent proposes, so any number past the screen behaves the same — and
 * unlike `Infinity` it survives the props bridge.
 */
const FILL = 100_000;

const ALIGN_X = {
  "flex-start": "leading",
  center: "center",
  "flex-end": "trailing",
} as const;

const ALIGN_Y = {
  "flex-start": "top",
  center: "center",
  "flex-end": "bottom",
} as const;

type AlignX = (typeof ALIGN_X)[keyof typeof ALIGN_X];
type AlignY = (typeof ALIGN_Y)[keyof typeof ALIGN_Y];

/** SwiftUI has no `centerLeading` & co. — a centered axis drops out of the name. */
const FRAME_ALIGNMENT = {
  "top-leading": "topLeading",
  "top-center": "top",
  "top-trailing": "topTrailing",
  "center-leading": "leading",
  "center-center": "center",
  "center-trailing": "trailing",
  "bottom-leading": "bottomLeading",
  "bottom-center": "bottom",
  "bottom-trailing": "bottomTrailing",
} as const;

function frameAlignment(y: AlignY = "top", x: AlignX = "leading") {
  return FRAME_ALIGNMENT[`${y}-${x}`];
}

/**
 * SwiftUI has no stylesheet, so the `style`/`className` props that do have a
 * modifier equivalent are translated by hand. Percentages and anything without
 * one (`position: absolute`, shadows, transforms) are dropped rather than
 * half-applied — use nesting and alignment instead of absolute positioning.
 */
function resolveStyle(
  style: StyleProp<ViewStyle>,
  { padding: defaultPadding, fillHeight = false } = {} as {
    padding?: number;
    /** Only `Card.Body` grows vertically; the other sections hug their content. */
    fillHeight?: boolean;
  },
) {
  const flat = StyleSheet.flatten(style) ?? {};

  const insets = omitUndefined({
    all: dp(flat.padding) ?? defaultPadding,
    horizontal: dp(flat.paddingHorizontal),
    vertical: dp(flat.paddingVertical),
    top: dp(flat.paddingTop),
    bottom: dp(flat.paddingBottom),
    leading: dp(flat.paddingLeft ?? flat.paddingStart),
    trailing: dp(flat.paddingRight ?? flat.paddingEnd),
  });

  const alignX = ALIGN_X[flat.alignItems as keyof typeof ALIGN_X];
  const alignY = ALIGN_Y[flat.justifyContent as keyof typeof ALIGN_Y];
  const grows = fillHeight || dp(flat.flex) !== undefined;

  // `.aspectRatio` only reshapes a view whose size is still up for negotiation,
  // so once one side is pinned the other is arithmetic.
  const ratio = dp(flat.aspectRatio);
  const styleWidth = dp(flat.width);
  const styleHeight = dp(flat.height);
  const boxWidth =
    styleWidth ?? (ratio && styleHeight ? styleHeight * ratio : undefined);
  const boxHeight =
    styleHeight ?? (ratio && styleWidth ? styleWidth / ratio : undefined);

  const box = omitUndefined({
    width: boxWidth,
    height: boxHeight,
    minWidth: dp(flat.minWidth),
    // Like a React Native `View`, a card and its sections span the width they
    // are offered unless an explicit one is set — Compose's `fillMaxWidth`.
    maxWidth: dp(flat.maxWidth) ?? (boxWidth === undefined ? FILL : undefined),
    minHeight: dp(flat.minHeight),
    maxHeight: dp(flat.maxHeight),
  });

  return {
    spacing: dp(flat.gap ?? flat.rowGap) ?? SPACING,
    radius: dp(flat.borderRadius),
    fill: flat.backgroundColor as string | undefined,
    alignment: alignX ?? "leading",
    // A `Spacer` absorbs leftover height; `maxHeight` would *demand* it and
    // stretch the card instead. Vertical alignment is spacers, not a frame.
    spacers: {
      leading: alignY === "center" || alignY === "bottom",
      trailing: alignY === "center" || (grows && alignY !== "bottom"),
    },
    /** Innermost first: pad, then size, then constrain the ratio. */
    modifiers: [
      ...(Object.keys(insets).length ? [padding(insets)] : []),
      ...(Object.keys(box).length
        ? [frame({ ...box, alignment: frameAlignment(alignY, alignX) })]
        : []),
      ...(ratio && !boxWidth && !boxHeight
        ? [aspectRatio({ ratio, contentMode: "fit" })]
        : []),
    ],
  };
}

/**
 * iOS has no `Card`. A grouped-background rounded rect *is* the native card, so
 * the solid variants just paint a themed surface; `transparent` is the one that
 * earns the SwiftUI trip — Liquid Glass can't be faked in React Native.
 */
function CardRootBase({
  children,
  variant = "default",
  onPress,
  style,
}: CardProps) {
  const isInsideHost = useIsInsideHost();
  const [surface, surfaceSecondary, surfaceTertiary] = useThemeColor([
    "surface",
    "surface-secondary",
    "surface-tertiary",
  ]);
  const {
    spacing,
    radius = RADIUS,
    fill,
    alignment,
    spacers,
    modifiers,
  } = resolveStyle(style, { padding: PADDING });

  const backgrounds = {
    default: surface,
    secondary: surfaceSecondary,
    tertiary: surfaceTertiary,
    transparent: null,
  } satisfies Record<SurfaceVariant, string | null>;

  const surfaceFill = fill ?? backgrounds[variant];
  // `padding` is modifiers[0], so the fill lands outside it and covers the card.
  const [inset, ...rest] = modifiers;

  const card = (
    <VStack
      alignment={alignment}
      spacing={spacing}
      modifiers={[
        inset,
        ...(surfaceFill
          ? [background(surfaceFill)]
          : [
              glassEffect({
                glass: { variant: "regular" },
                shape: "roundedRectangle",
                cornerRadius: radius,
              }),
            ]),
        clipShape("roundedRectangle", radius),
        ...rest,
        // After `clipShape`, so the tap area matches the rounded silhouette.
        ...(onPress ? [onTapGesture(onPress)] : []),
      ]}
    >
      {spacers.leading && <Spacer />}
      {children}
      {spacers.trailing && <Spacer />}
    </VStack>
  );

  return isInsideHost ? card : <Host matchContents>{card}</Host>;
}

const CardRoot = withUniwind(CardRootBase);

function CardSection({ children, style }: CardHeaderProps | CardFooterProps) {
  const { spacing, alignment, spacers, modifiers } = resolveStyle(style);

  return (
    <VStack alignment={alignment} spacing={spacing} modifiers={modifiers}>
      {spacers.leading && <Spacer />}
      {children}
      {spacers.trailing && <Spacer />}
    </VStack>
  );
}

const CardHeader = withUniwind(CardSection);
const CardFooter = withUniwind(CardSection);

/** The body's `flex-1`: its `Spacer` eats the slack down to the footer. */
function CardBodyBase({ children, style }: CardBodyProps) {
  const { spacing, alignment, spacers, modifiers } = resolveStyle(style, {
    fillHeight: true,
  });

  return (
    <VStack alignment={alignment} spacing={spacing} modifiers={modifiers}>
      {spacers.leading && <Spacer />}
      {children}
      {spacers.trailing && <Spacer />}
    </VStack>
  );
}

const CardBody = withUniwind(CardBodyBase);

function CardTitle({ children, numberOfLines, ...props }: CardTitleProps) {
  return (
    <Typography
      type="h5"
      weight="medium"
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Typography>
  );
}

function CardDescription({
  children,
  numberOfLines,
  ...props
}: CardDescriptionProps) {
  return (
    <Typography color="muted" numberOfLines={numberOfLines} {...props}>
      {children}
    </Typography>
  );
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Title: CardTitle,
  Description: CardDescription,
});
