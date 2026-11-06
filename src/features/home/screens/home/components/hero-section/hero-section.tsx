import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { Frame } from "panelui-web/frame";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { PRESS } from "@/components/ui/press";
import type { SearchParams } from "@/features/manga/utils/search-params";
import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { useRailScroll } from "../../hooks/use-rail-scroll";
import { useSizeClass } from "../../hooks/use-size-class";
import { SectionActions } from "../section-actions";
import { ROTATE_MS } from "./constants";

export interface HeroSectionProps {
  title: string;
  media: MangaEntry[];
  /** "Show all" opens /search with these. */
  params?: SearchParams;
}

const GAP = 14;

const genresOf = (manga: MangaEntry) =>
  manga.genres?.filter(Boolean).slice(0, 3).join(" · ");

/**
 * Expanded: a banner that fades through #1–6, beside their list. Smaller: a snapping row of
 * cover cards, most of the width each (compact) or half of it (medium).
 */
export function HeroSection({ title, media, params }: HeroSectionProps) {
  const size = useSizeClass();
  const { ref, scroll } = useRailScroll();
  const expanded = size === "expanded";

  return (
    <Frame variant="band">
      <Frame.Header>
        <Frame.Title>{title}</Frame.Title>
        <SectionActions
          title={title}
          params={params}
          onScroll={size === "medium" ? scroll : undefined}
        />
      </Frame.Header>
      <Frame.Panel>
        {expanded ? (
          <Banner media={media} />
        ) : (
          <HeroRow media={media} compact={size === "compact"} rowRef={ref} />
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
          const title = manga.title?.userPreferred ?? "";
          return (
            <Pressable
              key={manga.id}
              role="button"
              aria-label={`#${i + 1} trending: ${title}`}
              aria-hidden={!shown}
              focusable={shown}
              onPress={() => open(manga)}
              onHoverIn={() => hold()}
              onHoverOut={release}
              onFocus={() => hold()}
              onBlur={release}
              className={cn(
                PRESS,
                "absolute inset-0 flex-row gap-5 overflow-hidden rounded-xl p-5",
                "transition-opacity duration-700",
                shown ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              style={{ backgroundColor: manga.coverImage?.color ?? undefined }}
            >
              <Image
                source={manga.coverImage?.extraLarge ?? manga.coverImage?.large}
                blurRadius={40}
                contentFit="cover"
                style={{ position: "absolute", inset: 0, opacity: 0.6 }}
              />
              <View className="absolute inset-0 bg-black/45" />
              <Image
                source={manga.coverImage?.large}
                contentFit="cover"
                style={{
                  width: 120,
                  aspectRatio: 2 / 3,
                  borderRadius: 10,
                  alignSelf: "center",
                }}
              />
              <View className="min-w-0 flex-1 justify-end gap-1">
                <Typography type="body-xs" className="text-white/80 uppercase">
                  #{i + 1} trending
                </Typography>
                <Typography type="h3" numberOfLines={2} className="text-white">
                  {title}
                </Typography>
                <Typography
                  type="body-sm"
                  numberOfLines={1}
                  className="text-white/80"
                >
                  {genresOf(manga)}
                </Typography>
              </View>
            </Pressable>
          );
        })}
      </View>
      <View className="w-72 gap-1">
        {top.map((manga, i) => (
          <Pressable
            key={manga.id}
            role="button"
            aria-label={`#${i + 1} trending: ${manga.title?.userPreferred}`}
            aria-current={i === focus || undefined}
            onPress={() => open(manga)}
            onHoverIn={() => hold(i)}
            onHoverOut={release}
            onFocus={() => hold(i)}
            onBlur={release}
            className={cn(
              PRESS,
              "flex-row items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-accent",
              i === focus && "bg-accent",
            )}
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
          </Pressable>
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
  const open = useOpen();
  const [width, setWidth] = useState(0);
  const cardWidth = compact ? width * 0.86 : (width - GAP) / 2;

  return (
    <ScrollView
      ref={rowRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width - 16)}
      className="snap-x snap-mandatory"
      contentContainerClassName="p-2"
      contentContainerStyle={{ gap: GAP }}
    >
      {media.slice(0, 6).map((manga, i) => (
        <Pressable
          key={manga.id}
          role="button"
          aria-label={`#${i + 1} trending: ${manga.title?.userPreferred}`}
          onPress={() => open(manga)}
          style={{
            width: cardWidth,
            backgroundColor: manga.coverImage?.color ?? undefined,
          }}
          className={cn(
            PRESS,
            "h-52 snap-start justify-end overflow-hidden rounded-xl p-4",
          )}
        >
          <Image
            source={manga.coverImage?.extraLarge ?? manga.coverImage?.large}
            contentFit="cover"
            style={{ position: "absolute", inset: 0 }}
          />
          <View className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
          <Typography type="body-xs" className="text-white/80">
            #{i + 1} trending
          </Typography>
          <Typography type="large" numberOfLines={2} className="text-white">
            {manga.title?.userPreferred}
          </Typography>
        </Pressable>
      ))}
    </ScrollView>
  );
}
