import { AppState } from "react-native";
import { cache, cacheRestored, client, onAnswered } from "@/graphql/client";
import { network$, onReconnect } from "@/state/network";
import { session$ } from "@/state/session";
import { debouncer } from "@/utils/debouncer";
import { MangaDetailDocument } from "../graphql/manga-detail.generated";
import { MangaMediaFragmentDoc } from "../graphql/manga-fragments.generated";
import { SaveMangaTrackingDocument } from "../graphql/manga-tracking.generated";
import { fileSaved, refileEntry } from "../utils/file-entry";
import { pendingWrite } from "../utils/pending-write";
import { flushPending, type PendingEntry } from "./pending-entries";

const CONTEXT = {
  queueOffline: true,
  errorMessage: "Couldn't send your reading progress",
};

// Partial: any query that shows the manga caches its entry's progress.
const cachedEntry = (mediaId: number) =>
  cache.readFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: { __typename: "Media", id: mediaId },
    returnPartialData: true,
  })?.mediaListEntry;

const remoteOf = (mediaId: number) =>
  cachedEntry(mediaId)?.progress ?? undefined;

/**
 * Compares with AniList's entry as it is now, never the cache: the cache can
 * predate reading on another device, and saving over it would lower progress.
 */
async function send(mediaId: number, pending: PendingEntry) {
  const priorId = cachedEntry(mediaId)?.id;
  const { data } = await client.query({
    query: MangaDetailDocument,
    variables: { id: mediaId },
    fetchPolicy: "network-only",
    context: CONTEXT,
  });
  const media = data?.Media;
  const userId = session$.user.peek()?.id;
  if (media && userId != null) refileEntry(cache, userId, priorId, media);

  const write = pendingWrite(
    mediaId,
    pending,
    media?.mediaListEntry,
    media?.chapters,
    new Date(),
  );
  if (write?.kind !== "save") return;

  await client.mutate({
    mutation: SaveMangaTrackingDocument,
    variables: write.variables,
    context: CONTEXT,
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
  if (network$.online.peek() && session$.token.peek())
    await flushPending(remoteOf, send);
}

const later = debouncer<void>(() => void sendPending(), 2_000);

void cacheRestored.then(sendPending);
AppState.addEventListener("change", (state) => {
  if (state === "active") void sendPending();
});
onAnswered(() => later.run());
onReconnect(() => void sendPending());
