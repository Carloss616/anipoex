import type { ImageSource } from "expo-image";
import { cn } from "panelui-native/utils/cn";
import { TiltCard } from "panelui-web/tilt-card";
import type { CSSProperties, ReactNode } from "react";
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { tv } from "tailwind-variants";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { PRESS } from "@/components/ui/press";
import { Progress } from "@/components/ui/progress";
import { ScrimGradient } from "@/components/ui/scrim";
import type { TitlePosition } from "@/features/manga/utils/list-view";
import type { MediaStatus } from "@/graphql/types.generated";
import { CoverImage } from "./cover-image";
import { type CornerMark, cornerBadge } from "./utils";

/** The cover's corner radius, for placeholders that stand in for a card. */
export const COVER_RADIUS = 10;

export interface MangaCardProps {
  cover?: string | ImageSource | null;
  /** Low-res cover, blown up as a soft preview until `cover` decodes. */
  coverThumb?: string | null;
  coverColor?: string | null;
  status?: MediaStatus | null;
  /** A corner badge in place of the status, e.g. a source's current match. */
  mark?: CornerMark;
  title?: string | null;
  label?: string | null;
  /**
   * `over` keeps `title` and `label` on a scrim over the cover; `split` puts
   * only `label` on it, at its foot.
   */
  titlePosition?: TitlePosition;
  /** Share read (0–1), a bar under the label; omit if the total is unknown. */
  progress?: number;
  /** Chapters left, a top-right badge: green above 0, neutral at 0. */
  unread?: number;
  style?: StyleProp<ViewStyle>;
  /** The cover's corner radius; each platform's `COVER_RADIUS` when omitted. */
  radius?: number;
  className?: string;
  /** Spoken name: `title` is a node, so it can't be read off it. */
  accessibilityLabel?: string;
  testID?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  /**
   * Leans the cover towards the pointer, badges and title lifted off it.
   * @platform web
   */
  tilt?: boolean;
}

const cardStyles = tv({
  slots: {
    // The light under the pointer takes the cover's color.
    card: "[--pu-color:var(--glare)] w-full rounded-[inherit] border-0 p-0 transition-shadow",
    image: "",
    badges: "pointer-events-none absolute",
    text: "flex flex-col",
    // Long words break: line-clamp clips an overflow with no ellipsis.
    title: "relative line-clamp-2 text-sm hyphens-auto wrap-break-word",
    label: "relative text-xs",
  },
  variants: {
    position: {
      below: {
        card: cn(
          "flex flex-col gap-2 overflow-visible bg-transparent",
          "shadow-none shadow-(color:--glare)",
          // Flat like `over`: in 3D the layers' depth paints over the light.
          "transform-flat",
        ),
        image: cn(
          "relative aspect-2/3 w-full overflow-hidden rounded-[inherit] bg-card",
          "shadow-md shadow-(color:--glare) group-hover:shadow-sm transition-shadow",
        ),
        // Over the cover; the column doesn't clip, so they can move freely.
        badges: "inset-x-0 top-0 aspect-2/3",
        // A <button> centers its text by default.
        text: "gap-2 text-start",
        // Always two lines tall, so captions and bars line up across a row.
        title: "order-first min-h-10 leading-5",
        label:
          "self-start rounded-full bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground",
      },
      over: {
        card: "relative aspect-2/3 overflow-hidden bg-card shadow-md shadow-(color:--glare)",
        image: "absolute",
        badges: "inset-0",
        text: "absolute pt-12",
        title: "text-center text-white text-shadow-md/70",
        label: "line-clamp-1 text-center text-gray-50 text-shadow-md/70",
      },
    },
    tilt: { true: {}, false: {} },
  },
  compoundVariants: [
    // On tilt, room for their depth
    {
      position: "over",
      tilt: true,
      class: { image: "-inset-1", text: "-inset-x-3 -bottom-3 p-5" },
    },
    {
      position: "over",
      tilt: false,
      class: { image: "inset-0", text: "inset-x-0 bottom-0 p-2" },
    },
  ],
});

/** Moves by its depth as the card leans; a plain box without `tilt`. */
function Layer({
  tilt,
  depth,
  className,
  children,
}: {
  tilt: boolean;
  depth: number;
  className: string;
  children: ReactNode;
}) {
  return tilt ? (
    <TiltCard.Layer depth={depth} className={className}>
      {children}
    </TiltCard.Layer>
  ) : (
    <View className={className}>{children}</View>
  );
}

/** The web card; iOS and Android draw theirs inside the native grid's Host. */
export function MangaCard({
  cover,
  coverThumb,
  coverColor,
  status,
  mark,
  title,
  label,
  titlePosition = "over",
  progress,
  unread,
  style,
  radius,
  className,
  accessibilityLabel,
  testID,
  onPress,
  onLongPress,
  tilt = false,
  // On web, a menu trigger's ref, aria and key handlers, for the pressable.
  ...trigger
}: MangaCardProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const below = titlePosition !== "over";
  const split = titlePosition === "split" && !!label;
  const css = cardStyles({ position: below ? "below" : "over", tilt });
  const corner = cornerBadge(status, mark);
  const pressable = !!(onPress || onLongPress);
  const flatStyle = {
    "--glare": `color-mix(in oklab, ${coverColor ?? "var(--color-primary)"} 36%, transparent)`,
    ...flat,
  } as CSSProperties;
  const cardClassName = css.card({ className });

  const content = (
    <>
      <Layer tilt={tilt} depth={3} className={css.image()}>
        {cover ? (
          <CoverImage
            style={StyleSheet.absoluteFill}
            cover={cover}
            coverThumb={coverThumb}
            coverColor={coverColor}
          />
        ) : (
          <View
            style={StyleSheet.absoluteFill}
            className="items-center justify-center"
          >
            <Icon
              name="book-open"
              size={22}
              className="text-muted-foreground/20"
            />
          </View>
        )}
      </Layer>
      <Layer tilt={tilt} depth={10} className={css.badges()}>
        {corner && (
          <Badge
            color={corner.color}
            icon={corner.icon}
            className="absolute top-2 left-2"
          />
        )}
        {unread != null && (
          <Badge
            color={unread > 0 ? "success" : "secondary"}
            solid
            // Secondary is see-through (made for rows); a cover needs it solid.
            className={cn(
              "absolute top-2 right-2",
              unread === 0 && "bg-surface-secondary",
            )}
          >
            {String(unread)}
          </Badge>
        )}
        {split && (
          <View className="absolute inset-x-0 bottom-2 items-center">
            <Badge color="secondary" solid className="bg-surface-secondary">
              {label}
            </Badge>
          </View>
        )}
      </Layer>
      {(below || title || label) && (
        <Layer tilt={tilt} depth={6} className={css.text()}>
          {!below && (
            <ScrimGradient
              colorClassName="accent-black"
              style={StyleSheet.absoluteFill}
            />
          )}
          {label && !split && (
            <TiltCard.Description className={css.label()}>
              {label}
            </TiltCard.Description>
          )}
          {/* Not a heading: a button's content can't hold one. */}
          <TiltCard.Title as="p" className={css.title()}>
            {title}
          </TiltCard.Title>
          {below && progress != null && (
            <Progress value={progress * 100} size="sm" />
          )}
        </Layer>
      )}
    </>
  );

  const card = tilt ? (
    <TiltCard
      data-testid={testID}
      className="rounded-[inherit]"
      cardClassName={cardClassName}
      color="primary"
      style={flatStyle}
    >
      {content}
    </TiltCard>
  ) : (
    <View
      testID={testID}
      className={cn("rounded-[inherit]", cardClassName)}
      style={flatStyle as ViewStyle}
    >
      {content}
    </View>
  );
  // The card inherits it, so the focus ring follows its corners.
  const corners = { borderRadius: radius ?? (below ? COVER_RADIUS : 16) };

  // On web a disabled Pressable is pointer-events: none, killing the tilt.
  if (!pressable) {
    return (
      <View
        role={accessibilityLabel ? "img" : undefined}
        aria-label={accessibilityLabel}
        style={corners}
        data-title={titlePosition}
        className="group"
      >
        {card}
      </View>
    );
  }

  return (
    <Pressable
      {...trigger}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={corners}
      data-title={titlePosition}
      className={cn(PRESS, "group focus-visible:ring-ring")}
    >
      {card}
    </Pressable>
  );
}
