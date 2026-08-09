import { Link } from "expo-router";
import { memo } from "react";
import { MangaCard } from "@/features/manga/components/manga-card";
import type { MangaEntry } from "@/features/manga/utils/to-entries";

export const ListItem = memo(function ListItem({ item }: { item: MangaEntry }) {
  return (
    <Link href={`/manga/${item.id}`} asChild>
      <Link.Trigger>
        <MangaCard
          cover={item.cover}
          coverThumb={item.coverThumb}
          coverColor={item.coverColor}
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
  );
});
