import { Link } from "expo-router";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { EmptyState } from "@/components/empty-state";
import { LegendList } from "@/components/layout/legend-list";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Host } from "@/components/ui/host";
import { MangaCard } from "../../components/manga-card";
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
          <ScrollView direction="horizontal" showsIndicators={false}>
            <Row className="gutters gap-2 android:px-safe-offset-gx px-gx py-6">
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
        </Host>
      }
      renderItem={({ item }) => (
        <Link href={`/manga/${item.id}`} asChild>
          <Link.Trigger>
            <MangaCard
              cover="https://picsum.photos/seed/696/3000/2000"
              title={item.title}
              year={item.year}
            />
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
