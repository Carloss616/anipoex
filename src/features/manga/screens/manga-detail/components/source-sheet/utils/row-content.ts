import type { MenuItemDialogConfig } from "@/components/ui/menu";
import { type ExcludeReason, REASONS } from "@/features/manga/utils/msu";
import type { SourceStatus } from "./source-status";

const ORDER = Object.keys(REASONS) as ExcludeReason[];

/** The confirm dialog of the Excluded menu's Reset all. */
export const RESET_DIALOG: MenuItemDialogConfig = {
  title: "Reset exclusions?",
  description:
    "Your manual choices for this manga are cleared too, and every source is scanned again.",
  confirmLabel: "Reset",
};

/** What follows the badge on an available row: `c.{chapter}` (`?` when suspicious) and the age, each when present. */
export const statusDetail = ({ chapter, suspicious, age }: SourceStatus) =>
  [chapter !== undefined && `c.${chapter}${suspicious ? "?" : ""}`, age]
    .filter(Boolean)
    .join(" · ");

/** The reasons a row's menu offers, `bad-numbering` first when its numbering looks wrong. */
export const excludeReasons = (suspicious: boolean): ExcludeReason[] =>
  suspicious
    ? ["bad-numbering", ...ORDER.filter((r) => r !== "bad-numbering")]
    : ORDER;

/** An excluded row's badge: the reason, then whether you or a scan chose it. */
export const excludedBadge = (reason: ExcludeReason, pinned: boolean) =>
  `${REASONS[reason].badge} · ${pinned ? "you" : "auto"}`;
