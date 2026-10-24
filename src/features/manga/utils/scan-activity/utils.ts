/** The line under the manga's name: how far the scan has got, or what it found. */
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
