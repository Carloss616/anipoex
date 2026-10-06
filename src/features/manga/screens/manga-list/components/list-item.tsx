import { useFragment } from "@apollo/client/react";
import { useRouter } from "expo-router";
import { memo } from "react";
import { useResolveClassNames } from "uniwind";
import { MangaCard } from "@/features/manga/components/manga-card";
import { PUBLICATION_STATUSES } from "@/features/manga/constants";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { dp } from "@/utils/utils";
import { cellWidth } from "./list-scene/grid";

/** Progress from the cache, so it updates without a refetch: shown, and spoken. */
function useProgress({
  id,
  __typename,
}: Pick<MangaEntry, "id" | "__typename">) {
  const { data } = useFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: { __typename, id },
  });
  const read = data.mediaListEntry?.progress ?? 0;
  const total = data.chapters;

  return {
    label: `${read}/${total ?? "_"}`,
    spoken: total
      ? `${read} of ${total} chapters read`
      : `${read} chapters read`,
  };
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
  const progress = useProgress(item);
  const title = item.title?.userPreferred;

  return (
    <MangaCard
      style={width ? { width } : undefined}
      cover={item.coverImage?.medium}
      coverColor={item.coverImage?.color}
      status={item.status}
      title={title}
      label={progress.label}
      // The badge is a letter and the label a fraction: say both in words.
      accessibilityLabel={[
        title,
        item.status && PUBLICATION_STATUSES[item.status],
        progress.spoken,
      ]
        .filter(Boolean)
        .join(", ")}
      testID={`manga-card-${item.id}`}
      onPress={() => router.push(`/manga/${item.id}`)}
    />
  );
});
