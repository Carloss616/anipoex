import { cache } from "@/graphql/client";
import { MangaMediaFragmentDoc } from "../graphql/manga-fragments.generated";
import { effectiveProgress } from "./pending-entries";

/**
 * The progress the cache holds for a manga, with what waits offline: null
 * when it isn't on the list, undefined when the cache doesn't know.
 */
export function cachedProgress(mediaId: number) {
  const entry = cache.readFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: { __typename: "Media", id: mediaId },
    returnPartialData: true,
  })?.mediaListEntry;
  if (entry === null) return null;
  return entry?.progress == null
    ? undefined
    : effectiveProgress(entry.progress, mediaId);
}
