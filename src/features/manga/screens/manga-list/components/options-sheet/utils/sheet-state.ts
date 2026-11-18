import { observable } from "@legendapp/state";

export type OptionsTab = "filter" | "sort" | "display";

export const open$ = observable(false);

/** In memory: a reopen shows the tab left open, a launch starts on Filter. */
export const tab$ = observable<OptionsTab>("filter");

/** Opens the one `OptionsSheet` the screen renders. */
export const openOptionsSheet = () => open$.set(true);
