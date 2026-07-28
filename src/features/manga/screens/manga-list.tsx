import Lucide from "@react-native-vector-icons/lucide";
import { Link, Stack } from "expo-router";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { useThemeColor } from "heroui-native/hooks";
import { Typography } from "heroui-native/text";
import { useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { AppFlashList, AppScrollViewX } from "@/components/app";
import { EmptyState } from "@/components/empty-state";
import { Chip } from "@/components/ui/chip";
import { PressableFeedback } from "@/components/ui/pressable-feedback";
import { GENRES, MANGA } from "../mocks";

export function MangaList() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string>("Todo");
  const [mutedColor] = useThemeColor(["muted"]);
  const { width } = useWindowDimensions();

  const numColumns =
    width >= 1280 ? 12 : width >= 1024 ? 8 : width >= 768 ? 6 : 4;

  const manga = MANGA.filter(
    (m) =>
      (genre === "Todo" || m.genre === genre) &&
      m.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <Stack.Title large>Manga</Stack.Title>
      <Stack.SearchBar
        placeholder="Search..."
        placement="stacked"
        hideWhenScrolling={false}
        onChangeText={(e) => setQuery(e.nativeEvent.text)}
        onCancelButtonPress={() => setQuery("")}
      />

      <AppFlashList
        data={manga}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        gap={3}
        ListHeaderComponent={
          <AppScrollViewX
            contentContainerClassName="gap-3"
            wrapperClassName="mb-6"
          >
            {GENRES.map((g) => (
              <Chip
                key={g}
                variant="soft"
                color={genre === g ? "accent" : "default"}
                onPress={() => setGenre(g)}
              >
                <Chip.Label>{g}</Chip.Label>
              </Chip>
            ))}
          </AppScrollViewX>
        }
        renderItem={({ item }) => (
          <Link href={`/manga/${item.id}`} asChild>
            <Link.Trigger>
              <PressableFeedback className="overflow-visible">
                <Card
                  variant="secondary"
                  className="aspect-2/3 w-full justify-end p-0"
                >
                  <View
                    style={StyleSheet.absoluteFill}
                    className="items-center justify-center"
                  >
                    <Lucide name="book-open" size={22} color={mutedColor} />
                  </View>
                  <Card.Footer className="scrim p-2 pt-14">
                    <Card.Description
                      numberOfLines={1}
                      className="text-center text-gray-200 text-shadow-[0_1px_3px_#000000b3] text-xs"
                    >
                      {item.year}
                    </Card.Description>
                    <Card.Title
                      numberOfLines={2}
                      className="text-center text-shadow-[0_1px_3px_#000000b3] text-sm text-white"
                    >
                      {item.title}
                    </Card.Title>
                  </Card.Footer>
                  <PressableFeedback.Highlight />
                </Card>
              </PressableFeedback>
            </Link.Trigger>
            <Link.Preview />
            <Link.Menu>
              <Link.MenuAction icon="bookmark" onPress={() => {}}>
                Save
              </Link.MenuAction>
              <Link.MenuAction icon="square.and.arrow.up" onPress={() => {}}>
                Share
              </Link.MenuAction>
            </Link.Menu>
          </Link>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Nothing here"
            description={
              query ? (
                <>
                  We couldn't find any manga for{" "}
                  <Typography.Code className="text-xs">{query}</Typography.Code>
                  .
                </>
              ) : (
                <>
                  No manga in{" "}
                  <Typography.Code className="text-xs">{genre}</Typography.Code>{" "}
                  yet.
                </>
              )
            }
          >
            {genre !== "Todo" && (
              <Button
                variant="tertiary"
                size="sm"
                className="mt-1"
                onPress={() => setGenre("Todo")}
              >
                Show all
              </Button>
            )}
          </EmptyState>
        }
      />
    </>
  );
}
