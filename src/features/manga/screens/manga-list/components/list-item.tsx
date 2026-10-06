import { useFragment } from "@apollo/client/react";
import { useRouter } from "expo-router";
import { memo } from "react";
import { useResolveClassNames } from "uniwind";
import { MangaCard } from "@/features/manga/components/manga-card";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { dp } from "@/utils/utils";
import { cellWidth } from "./list-scene/grid";

/** "progress/chapters" from the cache, so it updates without a refetch. */
function useProgressLabel({
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

/**
 * Item width in a row styled by `rowClassName`, with padding and gap read from
 * the class. The native card needs it: Compose has no `aspectRatio`.
 */
export function useItemWidth(
  rowClassName: string,
  columns: number,
  width: number,
) {
  const s = useResolveClassNames(rowClassName);
  const x = dp(s.paddingHorizontal) ?? dp(s.padding) ?? 0;
  const left = dp(s.paddingLeft) ?? dp(s.paddingStart) ?? x;
  const right = dp(s.paddingRight) ?? dp(s.paddingEnd) ?? x;
  const gap = dp(s.columnGap) ?? dp(s.gap) ?? 0;

  return cellWidth(width - left - right, columns, gap);
}

/**
 * On native it navigates on press, since `Link.Trigger` can't live in the
 * grid's Host. The label is a string: native `Text` drops component children.
 */
export const ListItem = memo(function ListItem({
  item,
  width,
}: {
  item: MangaEntry;
  /** Required in the native grids: the card's height comes from it. */
  width?: number;
}) {
  const router = useRouter();
  const label = useProgressLabel(item);

  return (
    <MangaCard
      style={width ? { width } : undefined}
      cover={item.coverImage?.medium}
      coverColor={item.coverImage?.color}
      status={item.status}
      title={item.title?.userPreferred}
      label={label}
      accessibilityLabel={item.title?.userPreferred ?? undefined}
      testID={`manga-card-${item.id}`}
      onPress={() => router.push(`/manga/${item.id}`)}
    />
  );
});
