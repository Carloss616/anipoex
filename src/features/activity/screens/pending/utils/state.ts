import { pendingEntries$ } from "@/features/manga/state/pending-entries";

const ids = (failed: boolean) =>
  Object.entries(pendingEntries$.get())
    .filter(([, pending]) => !!pending.error === failed)
    .map(([id]) => id)
    .join();

/** The manga with a change still to be sent, joined. */
export const waitingIds = () => ids(false);

/** The manga whose kept change AniList turned down, joined. */
export const unsentIds = () => ids(true);

/** Every pending AniList change: waiting and not sent. */
export const pendingCount = () => Object.keys(pendingEntries$.get()).length;
