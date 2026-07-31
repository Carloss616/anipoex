import { Link, Stack } from "expo-router";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { EmptyState } from "@/components/empty-state";
import { FlashList } from "@/components/layout/flash-list";
import { ScrollViewX } from "@/components/layout/scroll-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { Scrim } from "@/components/ui/scrim";
import { Typography } from "@/components/ui/typography";
import { GENRES, MANGA } from "../mocks";

export function MangaList() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string>("Todo");
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

      <FlashList
        data={manga}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        gap={3}
        ListHeaderComponent={
          <>
            <Typography.Heading type="h5">Genres</Typography.Heading>
            <ScrollViewX
              wrapperClassName="mb-3"
              contentContainerClassName="gap-3 my-3"
            >
              {GENRES.map((g) => (
                <Chip
                  key={g}
                  variant="secondary"
                  selected={genre === g}
                  onPress={() => setGenre(g)}
                >
                  <Chip.Label>{g}</Chip.Label>
                </Chip>
              ))}
            </ScrollViewX>
          </>
        }
        renderItem={({ item }) => (
          <Link href={`/manga/${item.id}`} asChild>
            <Link.Trigger>
              <Card
                className="web:aspect-2/3 justify-end p-0"
                host={{
                  className: "aspect-2/3 w-full",
                }}
              >
                <Card.Background className="items-center justify-center">
                  <Icon
                    name={Icon.select({
                      ios: "book",
                      android: require("@expo/material-symbols/book_5.xml"),
                      web: "book-open",
                    })}
                    size={22}
                    className="text-muted/20"
                  />
                </Card.Background>
                <Scrim className="p-2">
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
                </Scrim>
              </Card>
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
