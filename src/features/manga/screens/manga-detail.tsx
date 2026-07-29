import { Lucide } from "@react-native-vector-icons/lucide";
import { Stack, useIsPreview, useLocalSearchParams } from "expo-router";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { useThemeColor } from "heroui-native/hooks";
import { Separator } from "heroui-native/separator";
import { Slider } from "heroui-native/slider";
import { Surface } from "heroui-native/surface";
import { Typography } from "heroui-native/text";
import { cn } from "heroui-native/utils";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppScrollView } from "@/components/app";
import { Chip } from "@/components/ui/chip";
import { PressableFeedback } from "@/components/ui/pressable-feedback";
import { CHAPTERS, MANGA_DETAIL, STATS } from "../mocks";

function Cover({ className }: { className?: string }) {
  const mutedColor = useThemeColor("muted");
  return (
    <Card className={cn("aspect-2/3 p-0", className)}>
      <View
        style={StyleSheet.absoluteFill}
        className="items-center justify-center"
      >
        <Lucide name="book-open" size={22} color={mutedColor} />
      </View>
    </Card>
  );
}

function Meta({ className }: { className?: string }) {
  const isPreview = useIsPreview();
  const mutedColor = useThemeColor("muted");
  return (
    <View className={cn("gap-2", className)}>
      <Typography.Heading type="h3" className={cn(!isPreview && "hidden")}>
        {MANGA_DETAIL.title}
      </Typography.Heading>
      <Typography.Paragraph type="body-sm" className="text-muted">
        {MANGA_DETAIL.author}
      </Typography.Paragraph>
      <View className="flex-row items-center gap-1">
        <Lucide name="star" size={13} color={mutedColor} />
        <Typography.Paragraph type="body-sm" className="text-muted">
          {MANGA_DETAIL.score} · {MANGA_DETAIL.year} · {MANGA_DETAIL.status}
        </Typography.Paragraph>
      </View>
      <View className="flex-row flex-wrap gap-2 pt-1">
        {MANGA_DETAIL.genres.map((g) => (
          <Chip key={g} variant="tertiary" size="sm">
            <Chip.Label>{g}</Chip.Label>
          </Chip>
        ))}
      </View>
    </View>
  );
}

function Actions({
  saved,
  onToggle,
}: {
  saved: boolean;
  onToggle: () => void;
}) {
  const mutedColor = useThemeColor("muted");
  return (
    <View className="flex-row items-center gap-3">
      <Button className="flex-1">
        <Lucide name="book-open" size={16} color="white" />
        <Button.Label>Continuar {MANGA_DETAIL.lastRead}</Button.Label>
      </Button>
      <Button isIconOnly variant="tertiary" onPress={onToggle}>
        <Lucide
          name={saved ? "bookmark-check" : "bookmark"}
          size={18}
          color={mutedColor}
        />
      </Button>
    </View>
  );
}

function Progress() {
  return (
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
  );
}

function Synopsis() {
  return (
    <Text className="max-w-2xl text-muted text-sm leading-5">
      {MANGA_DETAIL.synopsis}
    </Text>
  );
}

function Stats() {
  return (
    <Surface variant="secondary" className="flex-row p-4">
      {STATS.map((s, i) => (
        <View key={s.label} className="flex-1 flex-row items-center">
          {i > 0 && <Separator orientation="vertical" className="h-8" />}
          <View className="flex-1 items-center gap-0.5">
            <Text className="font-semibold text-base text-foreground">
              {s.value}
            </Text>
            <Text className="text-muted text-xs">{s.label}</Text>
          </View>
        </View>
      ))}
    </Surface>
  );
}

/** Wrap + fractional widths instead of gap math: RN has no CSS grid and no `calc(% - px)`. */
function Chapters() {
  const mutedColor = useThemeColor("muted");
  return (
    <View className="-m-1.5 flex-row flex-wrap">
      {CHAPTERS.map((c) => (
        <View key={c.id} className="w-full p-1.5 md:w-1/2 xl:w-1/3">
          <PressableFeedback className="overflow-visible">
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
              {c.read && <Lucide name="check" size={14} color={mutedColor} />}
              <Lucide name="chevron-right" size={16} color={mutedColor} />
              <PressableFeedback.Highlight />
            </Surface>
          </PressableFeedback>
        </View>
      ))}
    </View>
  );
}

export function MangaDetail() {
  const isPreview = useIsPreview();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [saved, setSaved] = useState(false);

  return (
    <>
      <Stack.Title large>{MANGA_DETAIL.title}</Stack.Title>

      <AppScrollView
        contentContainerClassName={cn(isPreview && "ios:bg-background")}
      >
        <View className="gap-6 lg:flex-row lg:gap-8">
          <View className="gap-6 lg:w-80">
            <View className="flex-row gap-4 md:gap-6 lg:flex-col lg:gap-5">
              <Cover className="w-30 md:w-36 lg:w-full" />
              <Meta className="flex-1 lg:flex-none" />
            </View>

            <Synopsis />
          </View>

          <View className="gap-6 lg:flex-1">
            <Actions saved={saved} onToggle={() => setSaved((s) => !s)} />
            <Progress />
            <Stats />
            <View className="gap-3">
              <Text className="font-semibold text-foreground">Capítulos</Text>
              <Chapters />
            </View>
            <Text className="text-muted text-xs">ID: {id}</Text>
          </View>
        </View>
      </AppScrollView>
    </>
  );
}
