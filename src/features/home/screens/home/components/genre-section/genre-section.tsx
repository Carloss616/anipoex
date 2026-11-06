import { useRouter } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { Frame } from "panelui-web/frame";
import { Pressable, View } from "react-native";
import { PRESS } from "@/components/ui/press";
import { useSizeClass } from "../../hooks/use-size-class";

export interface GenreSectionProps {
  title: string;
  genres: string[];
}

const LAYOUT = {
  compact: { count: 8, width: "w-1/2" },
  medium: { count: 12, width: "w-1/4" },
  // In the side column.
  expanded: { count: 8, width: "w-1/2" },
};

/** A hue of its own for each genre, steady across renders. */
const hue = (genre: string) =>
  [...genre].reduce((sum, char) => sum + char.charCodeAt(0) * 7, 0) % 360;

export function GenreSection({ title, genres }: GenreSectionProps) {
  const router = useRouter();
  const { count, width } = LAYOUT[useSizeClass()];

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>{title}</Frame.Title>
      </Frame.Header>
      <Frame.Panel>
        <View className="flex-row flex-wrap p-3">
          {genres.slice(0, count).map((genre) => (
            <View key={genre} className={cn("p-1", width)}>
              <Pressable
                role="button"
                aria-label={`${genre} manga`}
                onPress={() =>
                  router.push({ pathname: "/search", params: { genre } })
                }
                style={{
                  backgroundImage: `linear-gradient(135deg, hsl(${hue(genre)} 55% 42%), hsl(${hue(genre) + 40} 60% 30%))`,
                }}
                className={cn(PRESS, "h-16 justify-end rounded-xl p-3")}
              >
                <Typography type="small" className="text-white">
                  {genre}
                </Typography>
              </Pressable>
            </View>
          ))}
        </View>
      </Frame.Panel>
    </Frame>
  );
}
