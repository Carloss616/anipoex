import { useEffect } from "react";
import { session$ } from "@/state/session";
import { noop } from "@/utils/utils";
import { anilist } from "../trackers/anilist";

/**
 * Backfills a viewer persisted before `scoreFormat` existed — without it the
 * score can't be edited, since any guessed scale could save it wrong. Fetched
 * in the background; a failure keeps the score disabled until the next launch.
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
