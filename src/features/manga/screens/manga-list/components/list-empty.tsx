import type { ObservablePrimitive } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
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
  const genre = useValue(genre$);
  const query = useValue(query$);

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
      action={
        genre === ALL
          ? undefined
          : { label: "Show all", onPress: () => genre$.set(ALL) }
      }
    />
  );
});
