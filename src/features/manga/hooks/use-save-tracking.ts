import { useMutation } from "@apollo/client/react";
import {
  DeleteMangaTrackingDocument,
  SaveMangaTrackingDocument,
} from "../graphql/manga-tracking.generated";
import type { SaveVariables } from "../utils/tracking-form";

/**
 * Apollo merges the returned entry by id on its own; what it can't infer is the
 * first save, where `Media.mediaListEntry` was null and needs the link written.
 */
export function useSaveTracking(mediaId: number) {
  const [saveEntry, { loading: saving }] = useMutation(
    SaveMangaTrackingDocument,
    {
      context: { errorMessage: "Couldn't save your changes" },
      update(cache, { data }) {
        const entry = data?.SaveMediaListEntry;
        if (!entry) return;

        cache.modify({
          id: cache.identify({ __typename: "Media", id: mediaId }),
          fields: {
            mediaListEntry: () =>
              cache.identify(entry) ? { __ref: cache.identify(entry) } : null,
          },
        });
      },
    },
  );

  const [deleteEntry, { loading: removing }] = useMutation(
    DeleteMangaTrackingDocument,
    {
      context: { errorMessage: "Couldn't remove this from your list" },
      update(cache, { data }, { variables }) {
        if (!data?.DeleteMediaListEntry?.deleted) return;

        cache.modify({
          id: cache.identify({ __typename: "Media", id: mediaId }),
          fields: { mediaListEntry: () => null },
        });
        cache.evict({
          id: cache.identify({ __typename: "MediaList", id: variables?.id }),
        });
        cache.gc();
      },
    },
  );

  return {
    saving,
    removing,
    save: async (variables: SaveVariables) => {
      await saveEntry({ variables });
    },
    remove: async (entryId: number) => {
      await deleteEntry({ variables: { id: entryId } });
    },
  };
}
