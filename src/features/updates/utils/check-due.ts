import type { Settings } from "@/state/settings/utils/migrate";
import { CHECK_EVERY_MS } from "../constants";

/** Whether the daily update check is due; on unless turned off. */
export const isCheckDue = (
  { updateCheck, updateCheckedAt = 0 }: Settings["device"],
  now: number,
) => updateCheck !== false && now - updateCheckedAt >= CHECK_EVERY_MS;
