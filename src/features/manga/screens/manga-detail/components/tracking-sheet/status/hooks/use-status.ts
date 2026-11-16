import { useState } from "react";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import {
  describeChanges,
  setStatus,
} from "@/features/manga/utils/tracking-form";
import { awaitsDates, useReadDates } from "../../hooks/use-read-dates";

/**
 * The picked status and what confirming it would do. The rules run here so
 * the preview can't drift from them.
 */
export function useStatus(
  form: TrackingForm,
  mediaId: number,
  total?: number | null,
) {
  const [today] = useState(() => new Date());
  const [selected, setSelected] = useState(form.status);
  const { read, loading } = useReadDates(form, mediaId);

  const next = setStatus(form, selected, total, today, read);
  // Nothing to apply, nothing to announce: the preview and OK rise together.
  const dirty =
    next.status !== form.status && !awaitsDates(loading, form, next);
  const changes = dirty ? describeChanges(form, next, "status", total) : [];

  return { selected, setSelected, next, dirty, changes };
}
