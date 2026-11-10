import type { ScanActivity } from "../scan-activity";

/** The line under the manga's name: the scan's progress, or what it found. */
export function scanStatus({
  done,
  total,
  found,
  source,
}: {
  done: number;
  total: number;
  /** Set once the scan ends. */
  found: number | null;
  /** A rescan names its source instead of counting. */
  source?: string;
}) {
  if (source)
    return found === null
      ? `Scanning ${source}`
      : `${found ? "Found" : "Not found"} on ${source}`;
  return found === null
    ? `Scanning ${done} of ${total} sources`
    : `Found on ${found} of ${total} sources`;
}

export type Scan = Parameters<typeof scanStatus>[0] & { endedAt?: number };

/** How long an ended group still takes new scans, so rescans run one after
 * another sum up in one place. */
const JOIN_WINDOW = 2 * 60_000;

export const isRunning = (scans: Scan[]) => scans.some((s) => s.found === null);

/** The running Scan all, whose count a progress bar shows. */
export const counted = (scans: Scan[]) =>
  scans.find((s) => !s.source && s.found === null);

/**
 * A manga's scans show as one: a scan joins its manga's group while that one
 * runs or for a while after it ends, else starts a new one. `running`: the
 * group was already running, so it only needs an update.
 */
export function joinGroup<G extends { scans: Scan[] }>(
  groups: Map<number, G>,
  mangaId: number,
  scan: Scan,
  start: () => G,
) {
  const current = groups.get(mangaId);
  const running = current !== undefined && isRunning(current.scans);
  const lastEnd = Math.max(
    0,
    ...(current?.scans.map((s) => s.endedAt ?? 0) ?? []),
  );
  const group =
    current && (running || Date.now() - lastEnd < JOIN_WINDOW)
      ? current
      : start();
  groups.set(mangaId, group);
  group.scans.push(scan);
  return { group, running };
}

/** Records the scan's progress, then shows its group anew. */
export const trackScan = (
  scan: Scan,
  show: () => void,
): Omit<ScanActivity, "mark"> => ({
  progress: (done) => {
    scan.done = done;
    show();
  },
  end: (found) => {
    scan.done = scan.total;
    scan.found = found;
    scan.endedAt = Date.now();
    show();
  },
});

/**
 * One line for every scan of a manga: the running ones while any runs, else
 * what they all found.
 */
export function groupStatus(scans: Scan[]) {
  const running = scans.filter((s) => s.found === null);
  const shown = running.length ? running : scans;
  const all = shown.filter((s) => !s.source).map(scanStatus);
  const names = (keep: (s: Scan) => boolean) =>
    shown
      .filter((s) => s.source && keep(s))
      .map((s) => s.source)
      .join(", ");
  const scanning = names(() => true);
  const found = names((s) => !!s.found);
  const missed = names((s) => !s.found);
  const parts = running.length
    ? [...all, scanning && `Scanning ${scanning}`]
    : [
        ...all,
        found && `Found on ${found}`,
        missed && `Not found on ${missed}`,
      ];
  return parts.filter(Boolean).join(" · ");
}
