import type { ProviderProbe } from "./msu";
import type { Chapter } from "./to-chapters";

export type ProbeRead = { chapters: Chapter[] } | "no-match" | "error";

export function toProbe(
  source: { id: string; name: string },
  read: ProbeRead,
  now: number,
): ProviderProbe {
  const chapters = typeof read === "object" ? read.chapters : [];
  return {
    provider: source.id,
    providerName: source.name,
    latest: Math.max(0, ...chapters.map((c) => c.number)),
    count: chapters.length,
    matched: chapters.length > 0,
    errored: read === "error",
    updatedAt: now,
  };
}
