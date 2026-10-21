import type { ProviderProbe } from "./msu";
import type { Chapter } from "./to-chapters";

/** The chapters a source answered, no match, or what its search or chapter fetch threw. */
export type ProbeRead =
  | { chapters: Chapter[] }
  | "no-match"
  | { error: unknown };

export function toProbe(
  source: { id: string; name: string },
  read: ProbeRead,
  now: number,
): ProviderProbe {
  const chapters =
    typeof read === "object" && "chapters" in read ? read.chapters : [];
  const failed = typeof read === "object" && "error" in read;
  return {
    provider: source.id,
    providerName: source.name,
    latest: Math.max(0, ...chapters.map((c) => c.number)),
    count: chapters.length,
    matched: chapters.length > 0,
    errored: failed,
    ...(failed && {
      error:
        read.error instanceof Error ? read.error.message : String(read.error),
    }),
    updatedAt: now,
  };
}
