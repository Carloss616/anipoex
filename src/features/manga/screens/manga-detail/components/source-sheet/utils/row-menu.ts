import { Icons } from "@/components/ui/icon";
import type { MenuAction, MenuItem } from "@/components/ui/menu";
import type { Source } from "@/features/manga/utils/source";
import type { SourceActions } from "../hooks/use-source-actions";
import { errorDialog, excludeMenu, searchItem } from "./row-content";

interface RowMenuState {
  source: Source;
  /** The match page; Open website falls back to the source's home. */
  url: string | undefined;
  searching: boolean;
  scanning: boolean;
  /** The last read's failure, for See error. */
  error: string | undefined;
  actions: SourceActions;
  /** iOS: See error opens the sheet's dialog, not one hung on the menu. */
  onSeeError?: () => void;
}

/** Search, website and See error: what every source row's menu offers. */
function common(
  { source, url, searching, error, actions, onSeeError }: RowMenuState,
  onConfirmError: () => void,
  excluded: boolean,
): MenuAction[] {
  return [
    {
      ...searchItem(source, searching, actions),
      icon: searching ? Icons.searchTitlesOff : Icons.searchTitles,
    },
    ...(url || source.homeUrl
      ? [
          {
            label: "Open website",
            icon: Icons.website,
            onPress: () => actions.openWebsite(source, url),
          },
        ]
      : []),
    ...(error
      ? [
          onSeeError
            ? { label: "See error", icon: Icons.error, onPress: onSeeError }
            : {
                label: "See error",
                icon: Icons.error,
                onPressMode: "dialog" as const,
                dialogConfig: errorDialog(source.name, error, excluded),
                onPress: onConfirmError,
              },
        ]
      : []),
  ];
}

/** An available row's menu; native leads with Rescan or Stop, web has them as buttons. */
export function availableRowMenu(
  row: RowMenuState & {
    selected: boolean;
    suspicious: boolean;
    withRescan: boolean;
  },
): MenuItem[] {
  const { source, scanning, selected, suspicious, actions } = row;
  return [
    ...(row.withRescan
      ? [
          scanning
            ? {
                label: "Stop scanning",
                icon: Icons.close,
                onPress: () => actions.stop(source.id),
              }
            : {
                label: "Rescan",
                icon: Icons.refresh,
                onPress: () => actions.rescan(source.id),
              },
        ]
      : []),
    ...common(row, () => actions.rescan(source.id), false),
    ...(selected
      ? [
          {
            label: "Deselect",
            icon: Icons.deselect,
            onPress: () => actions.deselect(source.id),
          },
        ]
      : []),
    {
      ...excludeMenu(suspicious, (reason) =>
        actions.exclude(source.id, reason),
      ),
      icon: Icons.exclude,
    },
  ];
}

/** An excluded row's menu; Stop and Include join where the row has no button for them. */
export function excludedRowMenu(
  row: RowMenuState & { withStop: boolean; withInclude: boolean },
): MenuItem[] {
  const { source, scanning, actions } = row;
  const lead =
    scanning && row.withStop
      ? {
          label: "Stop scanning",
          icon: Icons.close,
          onPress: () => actions.stop(source.id),
        }
      : !scanning && row.withInclude
        ? {
            label: "Include",
            icon: Icons.undo,
            onPress: () => actions.include(source.id),
          }
        : undefined;
  return [
    ...(lead ? [lead] : []),
    ...common(row, () => actions.include(source.id), true),
  ];
}
