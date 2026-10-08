import { useFragment } from "@apollo/client/react";
import { useRouter } from "expo-router";
import { memo } from "react";
import { useResolveClassNames } from "uniwind";
import { MangaCard } from "@/features/manga/components/manga-card";
import { PUBLICATION_STATUSES } from "@/features/manga/constants";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import type { TitlePosition } from "@/features/manga/utils/list-view";
import { toProgress } from "@/features/manga/utils/progress";
import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { MediaStatus } from "@/graphql/types.generated";
import { dp, paddingX } from "@/utils/utils";
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
  return toProgress(data.mediaListEntry?.progress, data.chapters);
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
  const { left, right } = paddingX(s);
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
  titlePosition,
}: {
  item: MangaEntry;
  titlePosition: TitlePosition;
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
      // Most of a list is still releasing: only the exceptions get a tag.
      status={item.status === MediaStatus.Releasing ? undefined : item.status}
      title={title}
      label={progress.label}
      progress={progress.fraction}
      titlePosition={titlePosition}
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
