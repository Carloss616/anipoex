import type {
  MenuAction,
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

/**
 * The Excluded section's menu: a title search of its sources, retry while any
 * exclusion is automatic, then a confirmed reset; those two off during a scan.
 */
export const excludedMenuItems = (
  excluded: { pinned: boolean; source: { id: string } }[],
  busy: boolean,
  searching: boolean,
  actions: Pick<SourceActions, "retryAuto" | "resetAll" | "searchIn">,
): MenuAction[] => [
  {
    label: searching ? "Stop searching" : "Search titles",
    onPress: () => actions.searchIn(excluded.map((row) => row.source.id)),
  },
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

/**
 * A failed row's See error: what the source said, then Rescan, or Include on
 * an excluded row.
 */
export const errorDialog = (
  name: string,
  error: string,
  excluded = false,
): MenuItemDialogConfig => ({
  title: `Couldn't read ${name}`,
  description: error,
  confirmLabel: excluded ? "Include" : "Rescan",
});

/**
 * What follows the badge on an available row, each part empty when missing:
 * `c.{chapter}` (`?` when suspicious), as a neutral badge, then `· {age}`.
 */
export const statusDetail = ({ chapter, suspicious, age }: SourceStatus) => {
  const chapterText =
    chapter === undefined ? "" : `c.${chapter}${suspicious ? "?" : ""}`;
  return {
    chapter: chapterText,
    age: age ? (chapterText ? `· ${age}` : age) : "",
  };
};

/**
 * The reasons a row's menu offers, `bad-numbering` first when its numbering
 * looks wrong.
 */
export const excludeReasons = (suspicious: boolean): ExcludeReason[] =>
  suspicious
    ? ["bad-numbering", ...ORDER.filter((r) => r !== "bad-numbering")]
    : ORDER;

/** Who excluded a row, for its neutral badge beside the reason's. */
export const excludedBy = (pinned: boolean) => (pinned ? "you" : "auto");

/** The row menu's title-search item: start searching the source, or stop. */
export const searchItem = (
  source: { id: string; name: string },
  searching: boolean,
  actions: Pick<SourceActions, "searchOn" | "stopSearch">,
) =>
  searching
    ? {
        label: `Stop searching ${source.name}`,
        onPress: () => actions.stopSearch(source.id),
      }
    : {
        label: `Search on ${source.name}`,
        onPress: () => actions.searchOn(source.id),
      };
