import { toast } from "@/components/ui/toast";
import { pendingEntries$ } from "@/features/manga/state/pending-entries";
import { clearCache } from "@/graphql/client";
import { clearSession } from "@/state/session";

/** Signs out, reporting what failed to clear. */
export async function signOut() {
  // Kept progress belongs to this account: the next one must not receive it.
  pendingEntries$.set({});
  const results = await Promise.allSettled([clearSession(), clearCache()]);
  const failed = results.find((r) => r.status === "rejected");

  if (failed) {
    toast.error(
      failed.reason instanceof Error
        ? failed.reason.message
        : "Something went wrong",
    );
  }
}
