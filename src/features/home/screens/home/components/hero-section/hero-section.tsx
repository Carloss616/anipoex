import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { useEffect, useState } from "react";
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { LegendList } from "@/components/layout/legend-list";
import { PRESS } from "@/components/ui/press";
import { ScrimGradient } from "@/components/ui/scrim";
import { COVER_RADIUS } from "@/features/manga/components/manga-card";
import type { SearchParams } from "@/features/manga/utils/search-params";
import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { useRailScroll } from "../../hooks/use-rail-scroll";
import { SectionActions } from "../section-actions";
import { ROTATE_MS } from "./constants";

export interface HeroSectionProps {
  title: string;
  media: MangaEntry[];
  /** "Show all" opens /search with these. */
  params?: SearchParams;
}

const GAP = 12;
const CARD_HEIGHT = 208;

const genresOf = (manga: MangaEntry) =>
  manga.genres?.filter(Boolean).slice(0, 3).join(" · ");

/**
 * From `lg`, a banner that fades through #1–6 beside their list; narrower, a
 * snapping row of cover cards, most of the width each below `sm`, else half.
 */
export function HeroSection({ title, media, params }: HeroSectionProps) {
  const { isAtLeast } = useBreakpoint();
  const { ref, scroll, edges$ } = useRailScroll();
  const expanded = isAtLeast("lg");
  const compact = !isAtLeast("sm");

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>{title}</Frame.Title>
        <SectionActions
          title={title}
          params={params}
          onScroll={expanded || compact ? undefined : scroll}
          edges$={edges$}
        />
      </Frame.Header>
      <Frame.Panel>
        {expanded ? (
          <Banner media={media} />
        ) : (
          <HeroRow media={media} compact={compact} rowRef={ref} />
        )}
      </Frame.Panel>
    </Frame>
  );
}

function useOpen() {
  const router = useRouter();
  return (manga: MangaEntry) => router.push(`/manga/${manga.id}`);
}

/** Moves on by itself; a hover or keyboard focus picks one and holds it. */
function useRotation(count: number) {
  const reduced = useReducedMotion();
  const [focus, setFocus] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held || reduced || count < 2) return;
    const id = setInterval(() => setFocus((f) => (f + 1) % count), ROTATE_MS);
    return () => clearInterval(id);
  }, [held, reduced, count]);

  const hold = (index?: number) => {
    if (index != null) setFocus(index);
    setHeld(true);
  };
  return {
    focus: focus % Math.max(count, 1),
    hold,
    release: () => setHeld(false),
  };
}

function Banner({ media }: { media: MangaEntry[] }) {
  const open = useOpen();
  const top = media.slice(0, 6);
  const { focus, hold, release } = useRotation(top.length);
  if (!top.length) return null;

  return (
    <View className="flex-row gap-4 p-2">
      {/* Stacked, so the change is a crossfade with every cover loaded. */}
      <View className="min-h-56 min-w-0 flex-1">
        {top.map((manga, i) => {
          const shown = i === focus;
          return (
            <HeroCard
              key={manga.id}
              manga={manga}
              rank={i + 1}
              aria-hidden={!shown}
              focusable={shown}
              onHoverIn={() => hold()}
              onHoverOut={release}
              onFocus={() => hold()}
              onBlur={release}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                shown ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            />
          );
        })}
      </View>
      <View className="w-72 gap-1">
        {top.map((manga, i) => (
          <Button
            key={manga.id}
            variant="ghost"
            aria-label={`#${i + 1} trending: ${manga.title?.userPreferred}`}
            aria-current={i === focus || undefined}
            onClick={() => open(manga)}
            onMouseEnter={() => hold(i)}
            onMouseLeave={release}
            onFocus={() => hold(i)}
            onBlur={release}
            className={cn("h-auto gap-3 p-1.5", i === focus && "bg-accent")}
          >
            <Typography type="small" muted className="w-4 text-center">
              {i + 1}
            </Typography>
            <Image
              source={manga.coverImage?.medium}
              contentFit="cover"
              style={{
                width: 36,
                height: 52,
                borderRadius: 6,
                backgroundColor: manga.coverImage?.color ?? undefined,
              }}
            />
            <View className="min-w-0 flex-1">
              <Typography type="small" numberOfLines={1}>
                {manga.title?.userPreferred}
              </Typography>
              <Typography type="body-xs" muted numberOfLines={1}>
                {genresOf(manga)}
              </Typography>
            </View>
          </Button>
        ))}
      </View>
    </View>
  );
}

function HeroRow({
  media,
  compact,
  rowRef,
}: {
  media: MangaEntry[];
  compact: boolean;
  rowRef: ReturnType<typeof useRailScroll>["ref"];
}) {
  const [width, setWidth] = useState(0);
  const cardWidth = compact ? width * 0.86 : (width - GAP) / 2;

  return (
    <LegendList
      ref={rowRef}
      horizontal
      data={media.slice(0, 6)}
      keyExtractor={(manga) => String(manga.id)}
      estimatedItemSize={cardWidth}
      columnWrapperStyle={{ gap: GAP }}
      showsHorizontalScrollIndicator={false}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width - 32)}
      className="snap-x snap-mandatory scroll-ps-4"
      // The last card keeps the gap after it: 4 + 12 ends like the start.
      contentContainerClassName="py-4 ps-4 pe-1"
      style={{ minWidth: 0, minHeight: CARD_HEIGHT + 32 }}
      renderItem={({ item: manga, index: i }) => (
        <HeroCard
          manga={manga}
          rank={i + 1}
          className="snap-start"
          style={{ width: cardWidth, height: CARD_HEIGHT }}
        />
      )}
    />
  );
}

/** The cover edge to edge, its rank and title over a scrim. */
function HeroCard({
  manga,
  rank,
  className,
  style,
  ...props
}: {
  manga: MangaEntry;
  rank: number;
  className?: string;
  style?: ViewStyle;
} & Omit<PressableProps, "style" | "children">) {
  const open = useOpen();
  const title = manga.title?.userPreferred;

  return (
    <Pressable
      role="button"
      aria-label={`#${rank} trending: ${title}`}
      onPress={() => open(manga)}
      {...props}
      style={[
        {
          backgroundColor: manga.coverImage?.color ?? undefined,
          borderRadius: COVER_RADIUS,
        },
        style,
      ]}
      className={cn(PRESS, "justify-end overflow-hidden p-4", className)}
    >
      <Image
        source={manga.coverImage?.extraLarge ?? manga.coverImage?.large}
        contentFit="cover"
        style={{ position: "absolute", inset: 0 }}
      />
      <ScrimGradient
        colorClassName="accent-black"
        style={StyleSheet.absoluteFill}
      />
      <Typography type="body-xs" className="text-white/80">
        #{rank} trending
      </Typography>
      <Typography type="large" numberOfLines={2} className="text-white">
        {title}
      </Typography>
    </Pressable>
  );
}
