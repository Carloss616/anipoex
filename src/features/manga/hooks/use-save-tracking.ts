import { useMutation } from "@apollo/client/react";
import { isNetworkError } from "@/graphql/utils";
import { session$ } from "@/state/session";
import { failed, succeeded } from "@/utils/haptics";
import {
  DeleteMangaTrackingDocument,
  SaveMangaTrackingDocument,
} from "../graphql/manga-tracking.generated";
import { fileDeleted, fileSaved } from "../utils/file-entry";
import type { SaveVariables } from "../utils/tracking-form";

/**
 * Never the only feedback: the entry redraws, and the error link toasts. A
 * save kept offline (`queueOffline`) didn't fail, so it gets no failure buzz.
 */
async function felt<T>(work: Promise<T>, queueOffline = false) {
  try {
    const result = await work;
    succeeded();
    return result;
  } catch (error) {
    if (!(queueOffline && isNetworkError(error))) failed();
    throw error;
  }
}

export function useSaveTracking(mediaId: number) {
  const [saveEntry, { loading: saving }] = useMutation(
    SaveMangaTrackingDocument,
    {
      context: { errorMessage: "Couldn't save your changes" },
      update: (cache, { data }) =>
        fileSaved(
          cache,
          session$.user.peek()?.id,
          mediaId,
          data?.SaveMediaListEntry,
        ),
    },
  );

  const [deleteEntry, { loading: removing }] = useMutation(
    DeleteMangaTrackingDocument,
    {
      context: { errorMessage: "Couldn't remove this from your list" },
      update(cache, { data }, { variables }) {
        if (!data?.DeleteMediaListEntry?.deleted || variables == null) return;
        fileDeleted(cache, session$.user.peek()?.id, mediaId, variables.id);
      },
    },
  );

  return {
    saving,
    removing,
    /** `queueOffline`: the caller keeps the save when the connection drops. */
    save: async (variables: SaveVariables, { queueOffline = false } = {}) => {
      const result = await felt(
        saveEntry({
          variables,
          context: (base) => ({ ...base, queueOffline }),
        }),
        queueOffline,
      );
      return result.data?.SaveMediaListEntry;
    },
    remove: async (entryId: number) => {
      await felt(deleteEntry({ variables: { id: entryId } }));
    },
  };
}
