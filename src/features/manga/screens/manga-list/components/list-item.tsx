import { useFragment } from "@apollo/client/react";
import { Link } from "expo-router";
import { memo } from "react";
import { MangaCard } from "@/features/manga/components/manga-card";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import type { MangaEntry } from "@/features/manga/utils/to-entries";

/** Its own component so a progress write re-renders this, not the whole card. */
function ProgressLabel({
  id,
  __typename,
}: Pick<MangaEntry, "id" | "__typename">) {
  const { data } = useFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: { __typename, id },
  });

  return `${data.mediaListEntry?.progress ?? 0}/${data.chapters ?? "_"}`;
}

export const ListItem = memo(function ListItem({ item }: { item: MangaEntry }) {
  return (
    <Link href={`/manga/${item.id}`} asChild>
      <Link.Trigger>
        <MangaCard
          cover={item.coverImage?.medium}
          coverColor={item.coverImage?.color}
          status={item.status}
          title={item.title?.userPreferred}
          label={<ProgressLabel id={item.id} __typename={item.__typename} />}
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
