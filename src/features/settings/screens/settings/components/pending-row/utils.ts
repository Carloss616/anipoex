import { badgeCount } from "@/features/activity/utils/badge-count";

/** The number of changes waiting; empty when none. */
export function countLabel() {
  const count = badgeCount();
  return count ? String(count) : "";
}
