import type { ObservablePrimitive } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { memo } from "react";
import { EmptyState } from "@/components/blocks/empty-state";
import { ALL } from "@/features/manga/hooks/use-manga-list";

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

  return (
    <EmptyState
      title="Nothing here"
      description={
        query
          ? `We couldn't find any manga for “${query}”.`
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
        ...(genre === ALL
          ? []
          : [{ label: "Show all", onPress: () => genre$.set(ALL) }]),
      ]}
    />
  );
});
