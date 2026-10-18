import { router } from "expo-router";
import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { session$ } from "@/state/session";
import { anilist } from "../../../trackers/anilist";

function close() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}

/** AniList's OAuth round trip; the root guard redirects once a token lands. */
export function useSignIn() {
  const [isBusy, setIsBusy] = useState(false);

  async function signIn() {
    setIsBusy(true);
    try {
      const result = await anilist.authorize();
      if (!result) return;
      session$.token.set(result.accessToken);

      try {
        const user = await anilist.fetchViewer();
        session$.user.set(user);
      } catch (cause) {
        // Signed in either way — the profile just didn't load.
        toast.warning(
          `Signed in, but we couldn't load your profile: ${cause instanceof Error ? cause.message : cause}`,
        );
      }
      // No navigation: the root sign-in guard redirects once the token is set.
    } catch (cause) {
      toast.destructive(
        cause instanceof Error ? cause.message : "Something went wrong",
      );
    } finally {
      setIsBusy(false);
    }
  }

  return { isBusy, signIn, close };
}
