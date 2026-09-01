import { useEffect } from "react";
import { session$ } from "@/state/session";
import { noop } from "@/utils/utils";
import { anilist } from "../trackers/anilist";

/**
 * Backfills a viewer persisted before `scoreFormat` existed — without it the
 * score field silently runs on the fallback scale and can overwrite a score on
 * another one. Fetched in the background; a failure just keeps that fallback.
 */
export function useRefreshViewer() {
  useEffect(() => {
    if (!session$.token.peek() || session$.user.peek()?.scoreFormat) return;

    anilist
      .fetchViewer()
      .then((user) => session$.user.set(user))
      .catch(noop);
  }, []);
}
