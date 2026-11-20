export interface HistoryToolbarProps {
  onRefresh: () => Promise<void>;
}

/** Native lists refresh by pulling; only the web needs a button. */
export function HistoryToolbar(_: HistoryToolbarProps) {
  return null;
}
