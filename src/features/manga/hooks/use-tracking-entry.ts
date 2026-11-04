import { useFragment } from "@apollo/client/react";
import { MangaTrackingFragmentDoc } from "../graphql/manga-fragments.generated";

/**
 * Subscribes to the entry on its own `MediaList` node. `MangaDetail` spreads
 * the same fragment `@nonreactive`, so the detail query fetches these fields
 * but only callers of this re-render when one changes.
 */
export function useTrackingEntry(id: number | null | undefined) {
  const { data } = useFragment({
    fragment: MangaTrackingFragmentDoc,
    fragmentName: "MangaTracking",
    from: id == null ? null : { __typename: "MediaList", id },
  });

  return data;
}

export type MangaTracking = ReturnType<typeof useTrackingEntry>;
