import { AppState } from "react-native";
import { cache, cacheRestored, client, onAnswered } from "@/graphql/client";
import { session$ } from "@/state/session";
import { debouncer } from "@/utils/debouncer";
import {
  MangaMediaFragmentDoc,
  MangaTrackingFragmentDoc,
} from "../graphql/manga-fragments.generated";
import { SaveMangaTrackingDocument } from "../graphql/manga-tracking.generated";
import { fileSaved } from "../utils/file-entry";
import { pendingSave } from "../utils/pending-save";
import { flushPending, type PendingProgress } from "./pending-progress";

// Partial: any query that shows the manga caches its entry's progress.
const cachedMedia = (mediaId: number) =>
  cache.readFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: { __typename: "Media", id: mediaId },
    returnPartialData: true,
  });

const remoteOf = (mediaId: number) =>
  cachedMedia(mediaId)?.mediaListEntry?.progress ?? undefined;

async function send(mediaId: number, pending: PendingProgress) {
  const media = cachedMedia(mediaId);
  const entryId = media?.mediaListEntry?.id;
  const entry =
    entryId == null
      ? null
      : cache.readFragment({
          fragment: MangaTrackingFragmentDoc,
          fragmentName: "MangaTracking",
          from: { __typename: "MediaList", id: entryId },
        });

  await client.mutate({
    mutation: SaveMangaTrackingDocument,
    variables: pendingSave(
      mediaId,
      pending,
      entry && entryId != null ? { ...entry, id: entryId } : null,
      media?.chapters,
      new Date(),
    ),
    context: {
      queueOffline: true,
      errorMessage: "Couldn't send your reading progress",
    },
    update: (cache, { data }) =>
      fileSaved(
        cache,
        session$.user.peek()?.id,
        mediaId,
        data?.SaveMediaListEntry,
      ),
  });
}

/** Sends the progress kept offline, when signed in. */
export async function sendPending() {
  if (session$.token.peek()) await flushPending(remoteOf, send);
}

const later = debouncer<void>(() => void sendPending(), 2_000);

void cacheRestored.then(sendPending);
AppState.addEventListener("change", (state) => {
  if (state === "active") void sendPending();
});
onAnswered(() => later.run());
