import { Lucide } from "@react-native-vector-icons/lucide";
import { Card } from "heroui-native/card";
import { useThemeColor } from "heroui-native/hooks";
import { Slider } from "heroui-native/slider";
import { Surface } from "heroui-native/surface";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AppScrollView, AppScrollViewX } from "@/components/app";
import { ThemeToggle } from "@/components/theme-toggle";
import { Chip } from "@/components/ui/chip";
import { Typography } from "@/components/ui/typography";

// ponytail: static seed data — swap for the API once there is one
const FILTERS = ["Todo", "Anime", "Manga"] as const;

const CONTINUE = [
  { id: "1", title: "Frieren", meta: "Ep. 12 / 28", progress: 0.43 },
  { id: "2", title: "Chainsaw Man", meta: "Cap. 97 / 190", progress: 0.51 },
  { id: "3", title: "Vinland Saga", meta: "Ep. 4 / 24", progress: 0.17 },
];

const TRENDING = [
  {
    id: "1",
    title: "Jujutsu Kaisen",
    genre: "Acción · Sobrenatural",
    score: "8.9",
    kind: "Anime",
  },
  {
    id: "2",
    title: "Berserk",
    genre: "Dark fantasy",
    score: "9.4",
    kind: "Manga",
  },
  {
    id: "3",
    title: "Oshi no Ko",
    genre: "Drama · Seinen",
    score: "8.6",
    kind: "Anime",
  },
  {
    id: "4",
    title: "Blue Lock",
    genre: "Deportes",
    score: "8.2",
    kind: "Manga",
  },
];

export function Home() {
  const [filter, setFilter] = useState<string>("Todo");
  const mutedColor = useThemeColor("muted");

  const trending = TRENDING.filter(
    (i) => filter === "Todo" || i.kind === filter,
  );

  return (
    <AppScrollView contentContainerClassName="pt-6">
      <View className="mb-3 flex-row items-center justify-between gap-3">
        <View>
          <Typography className="font-semibold text-3xl text-foreground">
            Anipoex
          </Typography>
          <Text className="text-muted text-sm">
            Tu biblioteca de anime y manga
          </Text>
        </View>
        <ThemeToggle />
      </View>

      <AppScrollViewX
        wrapperClassName="mb-3"
        contentContainerClassName="gap-3 my-3"
      >
        {FILTERS.map((f) => (
          <Chip
            key={f}
            variant="secondary"
            selected={filter === f}
            onPress={() => setFilter(f)}
          >
            <Chip.Label>{f}</Chip.Label>
          </Chip>
        ))}
      </AppScrollViewX>

      <AppScrollViewX
        header={<Typography.Heading type="h4">Continue</Typography.Heading>}
        wrapperClassName="mb-3"
        contentContainerClassName="gap-3 my-3"
      >
        {CONTINUE.map((item) => (
          <Pressable key={item.id}>
            <Card variant="secondary" className="w-40 p-0">
              <View className="h-52 w-full items-center justify-center bg-surface-tertiary">
                <Lucide name="play" size={22} color={mutedColor} />
              </View>
              <Card.Header className="p-3 pb-1">
                <Card.Title numberOfLines={1} className="text-sm">
                  {item.title}
                </Card.Title>
                <Card.Description className="text-xs">
                  {item.meta}
                </Card.Description>
              </Card.Header>
              <Card.Footer>
                <Slider value={item.progress * 100}>
                  <Slider.Track className="h-1">
                    <Slider.Fill />
                  </Slider.Track>
                </Slider>
              </Card.Footer>
            </Card>
          </Pressable>
        ))}
      </AppScrollViewX>

      <View className="gap-3">
        <Typography.Heading type="h4">Tendencias</Typography.Heading>
        <View className="gap-3">
          {trending.map((item, i) => (
            <Pressable key={item.id}>
              <Surface
                variant="secondary"
                className="flex-row items-center gap-3 p-3"
              >
                <Text className="w-6 text-center font-semibold text-lg text-muted">
                  {i + 1}
                </Text>
                <View className="h-14 w-11 rounded-md bg-surface-tertiary" />
                <View className="flex-1 gap-0.5">
                  <Text
                    numberOfLines={1}
                    className="font-medium text-foreground"
                  >
                    {item.title}
                  </Text>
                  <Text className="text-muted text-xs">
                    {item.kind} · {item.genre}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Lucide name="star" size={13} color={mutedColor} />
                  <Text className="text-muted text-sm">{item.score}</Text>
                </View>
              </Surface>
            </Pressable>
          ))}
        </View>
      </View>
    </AppScrollView>
  );
}
