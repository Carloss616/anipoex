import { Icons } from "@/components/ui/icon";
import type { BadgeSegment } from "@/components/ui/split-badge";

/** A pill's downloads part; from 100 the glyph alone, as a cover is narrow. */
export const downloadSegment = (count: number): BadgeSegment => ({
  color: "primary",
  icon: Icons.downloaded,
  label: count < 100 ? String(count) : "",
});
