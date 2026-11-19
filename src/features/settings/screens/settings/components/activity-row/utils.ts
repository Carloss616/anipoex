import { activeScans$ } from "@/features/manga/state/active-scans";

/** "2 running" while scans run; empty otherwise. Reads only the ids. */
export function runningLabel() {
  const count = Object.keys(activeScans$.get(true)).length;
  return count ? `${count} running` : "";
}
