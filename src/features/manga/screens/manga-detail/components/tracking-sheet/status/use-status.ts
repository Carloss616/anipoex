import { useState } from "react";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import {
  describeChanges,
  setStatus,
} from "@/features/manga/utils/tracking-form";

/** The picked status and what confirming it would do. The rules run here so the preview can't drift from them. */
export function useStatus(form: TrackingForm, total?: number | null) {
  const [today] = useState(() => new Date());
  const [selected, setSelected] = useState(form.status);

  const next = setStatus(form, selected, total, today);
  // Nothing to apply, nothing to announce: the preview and OK rise together.
  const dirty = next.status !== form.status;
  const changes = dirty ? describeChanges(form, next, "status", total) : [];

  return { selected, setSelected, next, dirty, changes };
}
