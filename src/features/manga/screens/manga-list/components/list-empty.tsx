import type { ObservablePrimitive } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { memo } from "react";
import { EmptyState } from "@/components/blocks/empty-state";
import { ALL } from "@/features/manga/hooks/use-manga-list";
import {
  clearFilters,
  listOptions$,
} from "@/features/manga/state/list-options";
import { hasActiveFilters } from "@/features/manga/utils/list-options";

export const ListEmpty = memo(function ListEmpty({
  genre$,
  query$,
}: {
  genre$: ObservablePrimitive<string>;
  query$: ObservablePrimitive<string>;
}) {
  const router = useRouter();
  const genre = useValue(genre$);
  const query = useValue(query$).trim();
  const filtered = useValue(() => hasActiveFilters(listOptions$.filters.get()));

  return (
    <EmptyState
      title="Nothing here"
      description={
        query
          ? `We couldn't find any manga for “${query}”.`
          : filtered
            ? "No manga match these filters."
            : genre === ALL
              ? "This list is empty."
              : `No manga in “${genre}” yet.`
      }
      actions={[
        ...(query
          ? [
              {
                label: "Search on AniList",
                onPress: () =>
                  router.push({ pathname: "/search", params: { q: query } }),
              },
            ]
          : []),
        ...(filtered && !query
          ? [{ label: "Clear filters", onPress: clearFilters }]
          : []),
        ...(genre === ALL
          ? []
          : [{ label: "Show all", onPress: () => genre$.set(ALL) }]),
      ]}
    />
  );
});
