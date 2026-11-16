import { skipToken, useQuery } from "@apollo/client/react";
import { useValue } from "@legendapp/state/react";
import { MangaReadDatesDocument } from "@/features/manga/graphql/manga-read-dates.generated";
import { readDates } from "@/features/manga/utils/read-dates";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import { MediaListStatus } from "@/graphql/types.generated";
import { session$ } from "@/state/session";

/**
 * When the entry's reading began and ended, from the viewer's list activity,
 * for a Completed set in the sheet. Asked only when the entry lacks a date it
 * could fill.
 */
export function useReadDates(form: TrackingForm, mediaId: number) {
  const userId = useValue(() => session$.user.get()?.id);
  const needed =
    form.status !== MediaListStatus.Completed &&
    form.progress > 0 &&
    (!form.startedAt || !form.completedAt);

  const { data, loading } = useQuery(
    MangaReadDatesDocument,
    needed && userId != null
      ? {
          variables: { userId, mediaId },
          // Read fresh on each open; a failure just falls back to today.
          fetchPolicy: "no-cache",
          context: { silent: true },
        }
      : skipToken,
  );

  const rereading =
    form.status === MediaListStatus.Repeating || form.repeat > 0;

  return { read: readDates(data, rereading), loading };
}

/**
 * Whether confirming must wait: a change that completes the entry would save
 * today's dates while the activity loads.
 */
export const awaitsDates = (
  loading: boolean,
  form: TrackingForm,
  next: TrackingForm,
) =>
  loading &&
  next.status === MediaListStatus.Completed &&
  form.status !== MediaListStatus.Completed;
