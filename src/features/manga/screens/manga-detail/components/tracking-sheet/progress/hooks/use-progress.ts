import { useState } from "react";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import {
  describeChanges,
  setProgress,
} from "@/features/manga/utils/tracking-form";
import { tick } from "@/utils/haptics";
import { awaitsDates, useReadDates } from "../../hooks/use-read-dates";

/** The stepped chapter count and what confirming it would do. */
export function useProgress(
  form: TrackingForm,
  mediaId: number,
  total?: number | null,
) {
  const [today] = useState(() => new Date());
  const [value, setValue] = useState(form.progress);
  const { read, loading } = useReadDates(form, mediaId);

  const next = setProgress(form, value, total, today, read);
  // Nothing to apply, nothing to announce: the preview and OK rise together.
  const dirty =
    next.progress !== form.progress && !awaitsDates(loading, form, next);
  const changes = dirty ? describeChanges(form, next, "progress", total) : [];

  const step = (stepped: number) => {
    if (stepped === value) return;
    setValue(stepped);
    tick();
  };

  return { value, step, next, dirty, changes };
}
