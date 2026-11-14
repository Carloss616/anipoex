import { useRouter } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { Frame } from "panelui-web/frame";
import { useState } from "react";
import { Pressable } from "react-native";
import { PRESS } from "@/components/ui/press";
import { COVER_ROUNDED } from "@/features/manga/components/manga-card";
import { SectionActions } from "../section-actions";

export interface GenreSectionProps {
  title: string;
  genres: string[];
}

const COUNT = { base: 8, sm: 12, lg: 8 };

/** A hue of its own for each genre, steady across renders. */
const hue = (genre: string) =>
  [...genre].reduce((sum, char) => sum + char.charCodeAt(0) * 7, 0) % 360;

export function GenreSection({ title, genres }: GenreSectionProps) {
  const router = useRouter();
  const { isAtLeast } = useBreakpoint();
  const count = COUNT[isAtLeast("lg") ? "lg" : isAtLeast("sm") ? "sm" : "base"];
  const [page, setPage] = useState(0);
  const pages = Math.ceil(genres.length / count);
  // A resize can leave fewer pages than the one shown.
  const start = (page % pages) * count;

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>{title}</Frame.Title>
        {pages > 1 && (
          <SectionActions
            title={title}
            onScroll={(direction) =>
              setPage((p) => (p + direction + pages) % pages)
            }
          />
        )}
      </Frame.Header>
      <Frame.Panel className="grid grid-cols-2 gap-2 divide-y-0 p-4 sm:grid-cols-4 lg:grid-cols-2">
        {genres.slice(start, start + count).map((genre) => (
          <Pressable
            key={genre}
            role="button"
            aria-label={`${genre} manga`}
            onPress={() =>
              router.push({ pathname: "/search", params: { genre } })
            }
            style={{
              backgroundImage: `linear-gradient(135deg, hsl(${hue(genre)} 55% 42%), hsl(${hue(genre) + 40} 60% 30%))`,
            }}
            className={cn(PRESS, COVER_ROUNDED, "h-16 justify-end p-3")}
          >
            <Typography
              type="small"
              // In the side column, where "Psychological" needs the smaller text.
              className="text-white lg:text-xs"
            >
              {genre}
            </Typography>
          </Pressable>
        ))}
      </Frame.Panel>
    </Frame>
  );
}
