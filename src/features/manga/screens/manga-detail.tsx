import { Lucide } from "@react-native-vector-icons/lucide";
import { Stack, useIsPreview, useLocalSearchParams } from "expo-router";
import { Button } from "heroui-native/button";
import { Chip } from "heroui-native/chip";
import { useThemeColor } from "heroui-native/hooks";
import { Separator } from "heroui-native/separator";
import { Slider } from "heroui-native/slider";
import { Surface } from "heroui-native/surface";
import { Tabs } from "heroui-native/tabs";
import { Typography } from "heroui-native/text";
import { cn } from "heroui-native/utils";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AppScrollView } from "@/components/app";
import { CHAPTERS, MANGA_DETAIL, STATS } from "../mocks";

export function MangaDetail() {
  const isPreview = useIsPreview();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tab, setTab] = useState("chapters");
  const [saved, setSaved] = useState(false);
  const mutedColor = useThemeColor("muted");

  return (
    <>
      <Stack.Title large>{MANGA_DETAIL.title}</Stack.Title>

      <AppScrollView
        contentContainerClassName={cn(
          "gap-6",
          isPreview && "ios:bg-background",
        )}
      >
        <View className="flex-row gap-4">
          <View className="h-44 w-30 items-center justify-center rounded-lg bg-surface-tertiary">
            <Lucide name="book-open" size={24} color={mutedColor} />
          </View>
          <View className="flex-1 gap-2">
            <Typography
              className={cn(
                "font-semibold text-2xl text-foreground",
                !isPreview && "hidden",
              )}
            >
              {MANGA_DETAIL.title}
            </Typography>
            <Text className="text-muted text-sm">{MANGA_DETAIL.author}</Text>
            <View className="flex-row items-center gap-1">
              <Lucide name="star" size={13} color={mutedColor} />
              <Text className="text-muted text-sm">
                {MANGA_DETAIL.score} · {MANGA_DETAIL.year} ·{" "}
                {MANGA_DETAIL.status}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2 pt-1">
              {MANGA_DETAIL.genres.map((g) => (
                <Chip key={g} variant="tertiary" size="sm">
                  <Chip.Label>{g}</Chip.Label>
                </Chip>
              ))}
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          <Button className="flex-1">
            <Lucide name="book-open" size={16} color="white" />
            <Button.Label>Continuar {MANGA_DETAIL.lastRead}</Button.Label>
          </Button>
          <Button
            isIconOnly
            variant="tertiary"
            onPress={() => setSaved((s) => !s)}
          >
            <Lucide
              name={saved ? "bookmark-check" : "bookmark"}
              size={18}
              color={mutedColor}
            />
          </Button>
        </View>

        <View className="gap-2">
          <View className="flex-row justify-between">
            <Text className="text-muted text-xs">Progreso</Text>
            <Text className="text-muted text-xs">
              {Math.round(MANGA_DETAIL.progress * 100)}%
            </Text>
          </View>
          <Slider value={MANGA_DETAIL.progress * 100}>
            <Slider.Track className="h-1">
              <Slider.Fill />
            </Slider.Track>
          </Slider>
        </View>

        <Tabs value={tab} onValueChange={setTab} variant="secondary">
          <Tabs.List>
            <Tabs.Indicator />
            <Tabs.Trigger value="chapters">
              <Tabs.Label>Capítulos</Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="info">
              <Tabs.Label>Información</Tabs.Label>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="chapters" className="gap-3 pt-4">
            {CHAPTERS.map((c) => (
              <Pressable key={c.id}>
                <Surface
                  variant="secondary"
                  className="flex-row items-center gap-3 p-3"
                >
                  <View className="flex-1 gap-0.5">
                    <Text
                      numberOfLines={1}
                      className={
                        c.read
                          ? "font-medium text-muted"
                          : "font-medium text-foreground"
                      }
                    >
                      {c.title}
                    </Text>
                    <Text className="text-muted text-xs">{c.date}</Text>
                  </View>
                  {c.read && (
                    <Lucide name="check" size={14} color={mutedColor} />
                  )}
                  <Lucide name="chevron-right" size={16} color={mutedColor} />
                </Surface>
              </Pressable>
            ))}
          </Tabs.Content>

          <Tabs.Content value="info" className="gap-4 pt-4">
            <Text className="text-muted text-sm leading-5">
              {MANGA_DETAIL.synopsis}
            </Text>
            <Surface variant="secondary" className="flex-row p-4">
              {STATS.map((s, i) => (
                <View key={s.label} className="flex-1 flex-row items-center">
                  {i > 0 && (
                    <Separator orientation="vertical" className="h-8" />
                  )}
                  <View className="flex-1 items-center gap-0.5">
                    <Text className="font-semibold text-base text-foreground">
                      {s.value}
                    </Text>
                    <Text className="text-muted text-xs">{s.label}</Text>
                  </View>
                </View>
              ))}
            </Surface>
            <Text className="text-muted text-xs">ID: {id}</Text>
          </Tabs.Content>
        </Tabs>
      </AppScrollView>
    </>
  );
}
