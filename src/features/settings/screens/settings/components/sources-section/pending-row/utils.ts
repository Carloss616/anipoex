import { pendingCount } from "@/features/activity/screens/pending/utils/state";

/** The number of changes waiting; empty when none. */
export function countLabel() {
  const count = pendingCount();
  return count ? String(count) : "";
}
