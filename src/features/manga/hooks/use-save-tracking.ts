import { useMutation } from "@apollo/client/react";
import { session$ } from "@/state/session";
import { failed, succeeded } from "@/utils/haptics";
import {
  DeleteMangaTrackingDocument,
  SaveMangaTrackingDocument,
} from "../graphql/manga-tracking.generated";
import { fileEntry } from "../utils/file-entry";
import type { SaveVariables } from "../utils/tracking-form";

/** Never the only feedback: the entry redraws, and the error link toasts. */
async function felt<T>(work: Promise<T>) {
  try {
    const result = await work;
    succeeded();
    return result;
  } catch (error) {
    failed();
    throw error;
  }
}

/**
 * Apollo merges the returned entry and its media by id on its own; what it
 * can't infer is which lists hold the entry, nor the media's link to it, which
 * AniList returns as null even on an edit.
 */
export function useSaveTracking(mediaId: number) {
  const [saveEntry, { loading: saving }] = useMutation(
    SaveMangaTrackingDocument,
    {
      context: { errorMessage: "Couldn't save your changes" },
      update(cache, { data }) {
        const entry = data?.SaveMediaListEntry;
        const userId = session$.user.peek()?.id;
        if (!entry || userId == null) return;

        fileEntry(cache, userId, entry, entry.status);
        // Last: filing it writes the returned media, whose link is null.
        cache.modify({
          id: cache.identify({ __typename: "Media", id: mediaId }),
          fields: { mediaListEntry: () => ({ __ref: cache.identify(entry) }) },
        });
      },
    },
  );

  const [deleteEntry, { loading: removing }] = useMutation(
    DeleteMangaTrackingDocument,
    {
      context: { errorMessage: "Couldn't remove this from your list" },
      update(cache, { data }, { variables }) {
        if (!data?.DeleteMediaListEntry?.deleted || variables == null) return;

        const userId = session$.user.peek()?.id;
        if (userId != null) {
          const entry = { __typename: "MediaList" as const, id: variables.id };
          fileEntry(cache, userId, { ...entry, media: null }, null);
        }

        cache.modify({
          id: cache.identify({ __typename: "Media", id: mediaId }),
          fields: { mediaListEntry: () => null },
        });
        cache.evict({
          id: cache.identify({ __typename: "MediaList", id: variables.id }),
        });
        cache.gc();
      },
    },
  );

  return {
    saving,
    removing,
    save: async (variables: SaveVariables) => {
      const result = await felt(saveEntry({ variables }));
      return result.data?.SaveMediaListEntry?.id;
    },
    remove: async (entryId: number) => {
      await felt(deleteEntry({ variables: { id: entryId } }));
    },
  };
}
