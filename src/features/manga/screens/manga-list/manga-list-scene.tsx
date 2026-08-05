import { Link } from "expo-router";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { EmptyState } from "@/components/empty-state";
import { Column } from "@/components/layout/column";
import { LegendList } from "@/components/layout/legend-list";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Host } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Scrim } from "@/components/ui/scrim";
import { GENRES, type MangaEntry } from "../../mocks";

export function MangaListScene({
  entries,
  query = "",
}: {
  entries: MangaEntry[];
  /** Owned by the screen's native search bar, shared across every tab. */
  query?: string;
}) {
  const [genre, setGenre] = useState<string>("Todo");
  const { width } = useWindowDimensions();

  const numColumns =
    width >= 1280 ? 12 : width >= 1024 ? 8 : width >= 768 ? 6 : 4;

  const manga = entries.filter(
    (m) =>
      (genre === "Todo" || m.genre === genre) &&
      m.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <LegendList
      data={manga}
      numColumns={numColumns}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={{ gap: 2 }}
      contentContainerClassName="gutters px-safe-offset-gx pb-safe-offset-gb"
      ListHeaderComponentClassName="gutters mx-bleed-safe-gx"
      ListHeaderComponent={
        <Host matchContents={{ vertical: true }} className="w-full">
          <Column>
            <ScrollView direction="horizontal" showsIndicators={false}>
              <Row className="gutters gap-3 android:px-safe-offset-gx px-gx py-6">
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
              </Row>
            </ScrollView>
          </Column>
        </Host>
      }
      renderItem={({ index, item }) => (
        <Link href={`/manga/${item.id}`} asChild>
          <Link.Trigger>
            <Card
              className="web:aspect-2/3 justify-end p-0"
              host={{
                className: "aspect-2/3 w-full",
                ignoreSafeArea: "all",
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
              <Scrim className="ios:rounded-3xl p-2 pt-12">
                <Card.Description
                  numberOfLines={1}
                  className="text-center text-gray-50 text-shadow-[0_1px_3px_#000000b3] text-xs"
                >
                  {item.year} - {index}
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
          host={{
            className: "flex-1 web:justify-center",
          }}
          title="Nothing here"
          description={
            query
              ? `We couldn't find any manga for “${query}”.`
              : genre === "Todo"
                ? "This list is empty."
                : `No manga in “${genre}” yet.`
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
  );
}
