import { Spacer, VStack, ZStack } from "@expo/ui/swift-ui";
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
import { Children, isValidElement, type ReactNode } from "react";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { withUniwind } from "uniwind";
import { dp, omitUndefined } from "@/utils/utils";
import type { CardBackgroundProps, CardProps } from "./card";
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

  const fixed = omitUndefined({ width: boxWidth, height: boxHeight });
  const bounds = omitUndefined({
    minWidth: dp(flat.minWidth),
    // Like a React Native `View`, a card and its sections span what they are
    // offered unless an explicit size is set — `100%` asks for exactly that.
    maxWidth: dp(flat.maxWidth) ?? (boxWidth === undefined ? FILL : undefined),
    minHeight: dp(flat.minHeight),
    maxHeight:
      dp(flat.maxHeight) ?? (flat.height === "100%" ? FILL : undefined),
  });
  const alignment = frameAlignment(alignY, alignX);

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
      // Native `frame` takes SwiftUI's `width:height:` overload as soon as one
      // side is fixed, dropping the min/max — so the bounds get their own frame
      // underneath. Without it a fixed-height section hugs its content width.
      ...(Object.keys(bounds).length ? [frame({ ...bounds, alignment })] : []),
      ...(Object.keys(fixed).length ? [frame({ ...fixed, alignment })] : []),
      ...(ratio && !boxWidth && !boxHeight
        ? [aspectRatio({ ratio, contentMode: "fit" })]
        : []),
    ],
  };
}

/**
 * SwiftUI stacks with a `ZStack`, so the layer itself is just a passthrough —
 * `CardRootBase` pulls it out of the flow and puts it behind the sections.
 */
function CardBackground({ children }: CardBackgroundProps) {
  return <>{children}</>;
}

/** Splits the background layers out of the sections that stack on top. */
function partition(children: ReactNode) {
  const kids = Children.toArray(children);
  const isLayer = (kid: ReactNode) =>
    isValidElement(kid) && kid.type === CardBackground;

  return [kids.filter(isLayer), kids.filter((kid) => !isLayer(kid))] as const;
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
  host = { matchContents: true },
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
  const [layers, sections] = partition(children);

  const skin = [
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
  ];

  const flow = (
    <VStack
      alignment={alignment}
      spacing={spacing}
      modifiers={
        // With layers underneath the stack owns the surface, and the sections
        // only pad themselves — but they still have to span it.
        layers.length
          ? [inset, frame({ maxWidth: FILL, maxHeight: FILL, alignment })]
          : [inset, ...skin]
      }
    >
      {spacers.leading && <Spacer />}
      {sections}
      {spacers.trailing && <Spacer />}
    </VStack>
  );

  const card = layers.length ? (
    <ZStack modifiers={skin}>
      {layers}
      {flow}
    </ZStack>
  ) : (
    flow
  );

  return isInsideHost ? card : <Host {...host}>{card}</Host>;
}

const CardRoot = withUniwind(CardRootBase);

function CardSection({ children, style }: CardHeaderProps | CardFooterProps) {
  const { spacing, fill, alignment, spacers, modifiers } = resolveStyle(style);

  return (
    <VStack
      alignment={alignment}
      spacing={spacing}
      // Outside the frame modifiers, so the fill covers the whole section.
      modifiers={[...modifiers, ...(fill ? [background(fill)] : [])]}
    >
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
  const { spacing, fill, alignment, spacers, modifiers } = resolveStyle(style, {
    fillHeight: true,
  });

  return (
    <VStack
      alignment={alignment}
      spacing={spacing}
      modifiers={[...modifiers, ...(fill ? [background(fill)] : [])]}
    >
      {spacers.leading && <Spacer />}
      {children}
      {spacers.trailing && <Spacer />}
    </VStack>
  );
}

const CardBody = withUniwind(CardBodyBase);

function CardTitle({ children, ...props }: CardTitleProps) {
  return (
    <Typography type="h5" weight="medium" {...props}>
      {children}
    </Typography>
  );
}

function CardDescription({ children, ...props }: CardDescriptionProps) {
  return (
    <Typography color="muted" {...props}>
      {children}
    </Typography>
  );
}

/**
 * iOS Card: same props as `heroui-native`'s, rendered as a SwiftUI `VStack` of
 * sections — a `ZStack` once a `Card.Background` layer is in play.
 *
 * @see https://heroui.com/docs/native/components/card
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/zstack/
 */
export const Card = Object.assign(CardRoot, {
  Background: CardBackground,
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Title: CardTitle,
  Description: CardDescription,
});
