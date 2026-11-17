import { pendingEntries$ } from "@/features/manga/state/pending-entries";
import { discardPending } from "@/features/manga/state/queue-entry";
import { sendPending } from "@/features/manga/state/send-pending";

export { discardPending };

export function retryUnsent(mediaId: string) {
  pendingEntries$[mediaId].error.delete();
  void sendPending();
}
