import { useValue } from "@legendapp/state/react";
import { toast } from "@/components/ui/toast";
import { clearCache } from "@/graphql/client";
import { clearSession, session$ } from "@/state/session";

/** The signed-in viewer, and a sign-out that reports what failed to clear. */
export function useSignOut() {
  const user = useValue(session$.user);

  async function signOut() {
    const results = await Promise.allSettled([clearSession(), clearCache()]);
    const failed = results.find((r) => r.status === "rejected");

    if (failed) {
      toast.destructive(
        failed.reason instanceof Error
          ? failed.reason.message
          : "Something went wrong",
      );
    }
  }

  return { greeting: user ? `Hi, ${user.name}` : "Signed in", signOut };
}
