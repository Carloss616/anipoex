import {
  Column,
  Shape,
  Surface,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  fillMaxHeight,
  fillMaxWidth,
  height,
  padding,
  Shapes,
  weight,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
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
import { dp } from "@/utils/utils";
import type { CardProps } from "./card";
import { Host, useIsInsideHost } from "./host";
import { Typography } from "./typography";

/** Matches heroui's `--radius-3xl` / `p-4` so web and native cards agree. */
const RADIUS = 24;
const PADDING = 16;
const SPACING = 8;

/** Elevation in dp, mirroring M3's filled / elevated / outlined cards. */
const ELEVATION = {
  default: 0,
  secondary: 1,
  tertiary: 0,
  transparent: 0,
} as const satisfies Record<SurfaceVariant, number>;

type ColumnProps = React.ComponentProps<typeof Column>;
type HorizontalAlignment = NonNullable<ColumnProps["horizontalAlignment"]>;
type VerticalArrangement = NonNullable<ColumnProps["verticalArrangement"]>;

const ALIGN_X = {
  "flex-start": "start",
  center: "center",
  "flex-end": "end",
} as const satisfies Record<string, HorizontalAlignment>;

const ALIGN_Y = {
  "flex-start": "top",
  center: "center",
  "flex-end": "bottom",
  "space-between": "spaceBetween",
  "space-around": "spaceAround",
  "space-evenly": "spaceEvenly",
} as const satisfies Record<string, VerticalArrangement>;

/**
 * Compose takes modifiers, not stylesheets, so the `style`/`className` props
 * that do have an equivalent are translated by hand. Percentages and anything
 * without one (`position: absolute`, shadows, transforms) are dropped rather
 * than half-applied — use nesting and alignment instead of absolute positioning.
 */
function resolveStyle(
  style: StyleProp<ViewStyle>,
  { padding: defaultPadding = 0, stretch = false } = {} as {
    padding?: number;
    stretch?: boolean;
  },
) {
  const flat = StyleSheet.flatten(style) ?? {};

  const all = dp(flat.padding) ?? defaultPadding;
  const horizontal = dp(flat.paddingHorizontal) ?? all;
  const vertical = dp(flat.paddingVertical) ?? all;

  const alignX = ALIGN_X[flat.alignItems as keyof typeof ALIGN_X];
  const alignY = ALIGN_Y[flat.justifyContent as keyof typeof ALIGN_Y];
  const grows = stretch || dp(flat.flex) !== undefined;

  // Compose has no `aspectRatio` modifier, so derive the missing side instead.
  const ratio = dp(flat.aspectRatio);
  const boxWidth = dp(flat.width);
  const boxHeight =
    dp(flat.height) ?? (boxWidth && ratio ? boxWidth / ratio : undefined);

  const spacing = dp(flat.gap ?? flat.rowGap) ?? SPACING;

  return {
    radius: dp(flat.borderRadius),
    fill: flat.backgroundColor as string | undefined,
    alignment: alignX,
    // `spacedBy` and an alignment are the same slot here — an explicit
    // `justify-*` wins and the gap goes with it.
    arrangement: alignY ?? { spacedBy: spacing },
    /** Sizing before padding, so the padding stays inside the given box. */
    modifiers: [
      boxWidth === undefined ? fillMaxWidth() : width(boxWidth),
      ...(boxHeight !== undefined
        ? [height(boxHeight)]
        : grows || alignY
          ? [fillMaxHeight()]
          : []),
      padding(
        dp(flat.paddingLeft ?? flat.paddingStart) ?? horizontal,
        dp(flat.paddingTop) ?? vertical,
        dp(flat.paddingRight ?? flat.paddingEnd) ?? horizontal,
        dp(flat.paddingBottom) ?? vertical,
      ),
    ],
  };
}

function CardRootBase({
  children,
  variant = "default",
  onPress,
  style,
}: CardProps) {
  const isInsideHost = useIsInsideHost();
  const accent = useThemeColor("accent");
  const m3 = useMaterialColors({ seedColor: accent });
  const {
    radius = RADIUS,
    fill,
    alignment,
    arrangement,
    modifiers,
  } = resolveStyle(style, { padding: PADDING });

  const backgrounds = {
    default: m3.surfaceContainerHighest,
    secondary: m3.surfaceContainerLow,
    tertiary: m3.surfaceContainer,
    transparent: "transparent",
  } satisfies Record<SurfaceVariant, string>;

  // `Surface` rather than `Card`: it takes the shape as a prop, so Compose
  // clips the ripple to it. A `clip` modifier on a `Card` would bound the
  // ripple but also cut off the elevation shadow it draws outside its bounds.
  const card = (
    <Surface
      color={fill ?? backgrounds[variant]}
      shadowElevation={ELEVATION[variant]}
      shape={Shape.RoundedCorner({
        cornerRadii: {
          topStart: radius,
          topEnd: radius,
          bottomStart: radius,
          bottomEnd: radius,
        },
      })}
      border={
        variant === "tertiary"
          ? { width: 1, color: m3.outlineVariant }
          : undefined
      }
      onClick={onPress}
    >
      <Column
        modifiers={modifiers}
        horizontalAlignment={alignment}
        verticalArrangement={arrangement}
      >
        {children}
      </Column>
    </Surface>
  );

  return isInsideHost ? card : <Host matchContents>{card}</Host>;
}

const CardRoot = withUniwind(CardRootBase);

function CardSection({ children, style }: CardHeaderProps | CardFooterProps) {
  const { fill, radius, alignment, arrangement, modifiers } =
    resolveStyle(style);

  return (
    <Column
      modifiers={[
        ...(radius === undefined ? [] : [clip(Shapes.RoundedCorner(radius))]),
        ...(fill === undefined ? [] : [background(fill)]),
        ...modifiers,
      ]}
      horizontalAlignment={alignment}
      verticalArrangement={arrangement}
    >
      {children}
    </Column>
  );
}

const CardHeader = withUniwind(CardSection);
const CardFooter = withUniwind(CardSection);

/** `weight(1)` is Compose's `flex-1`: it claims the slack down to the footer. */
function CardBodyBase({ children, style }: CardBodyProps) {
  const { alignment, arrangement, modifiers } = resolveStyle(style, {
    stretch: true,
  });

  return (
    <Column
      modifiers={[weight(1), ...modifiers]}
      horizontalAlignment={alignment}
      verticalArrangement={arrangement}
    >
      {children}
    </Column>
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
