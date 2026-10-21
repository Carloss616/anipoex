import type {
  MenuItem,
  MenuItemDialogConfig,
  MenuSubmenu,
} from "@/components/ui/menu";
import { type ExcludeReason, REASONS } from "@/features/manga/utils/msu";
import type { SourceActions } from "../hooks/use-source-actions";
import type { SourceStatus } from "./source-status";

const ORDER = Object.keys(REASONS) as ExcludeReason[];

/** The confirm dialog of the Excluded menu's Reset all. */
const RESET_DIALOG: MenuItemDialogConfig = {
  title: "Reset exclusions?",
  description:
    "Your manual choices for this manga are cleared too, and every source is scanned again.",
  confirmLabel: "Reset",
};

/** The Excluded section's menu: retry while any exclusion is automatic, then a confirmed reset; both off during a scan. */
export const excludedMenuItems = (
  excluded: { pinned: boolean }[],
  busy: boolean,
  actions: Pick<SourceActions, "retryAuto" | "resetAll">,
): MenuItem[] => [
  ...(excluded.some((row) => !row.pinned)
    ? [
        {
          label: "Retry auto-excluded",
          disabled: busy,
          onPress: actions.retryAuto,
        },
      ]
    : []),
  {
    label: "Reset all",
    destructive: true,
    disabled: busy,
    onPressMode: "dialog",
    dialogConfig: RESET_DIALOG,
    onPress: actions.resetAll,
  },
];

/** An available row's Exclude submenu, a reason per row. */
export const excludeMenu = (
  suspicious: boolean,
  onExclude: (reason: ExcludeReason) => void,
): MenuSubmenu => ({
  label: "Exclude",
  items: excludeReasons(suspicious).map((reason) => ({
    label: REASONS[reason].menu,
    destructive: true,
    onPress: () => onExclude(reason),
  })),
});

/** A failed row's See error: what the source said, then Rescan, or Include on an excluded row. */
export const errorDialog = (
  name: string,
  error: string,
  excluded = false,
): MenuItemDialogConfig => ({
  title: `Couldn't read ${name}`,
  description: error,
  confirmLabel: excluded ? "Include" : "Rescan",
});

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
