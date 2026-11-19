import { askToNotify } from "@/features/manga/utils/scan-activity";
import { startReadingScan } from "./actions";

/** The empty state when nothing runs or waits anywhere. */
export const ALL_CAUGHT_UP = {
  title: "All caught up",
  description: "Scans, downloads and changes waiting to be sent show up here.",
  actions: [
    {
      label: "Scan Reading",
      onPress: () => {
        askToNotify();
        startReadingScan();
      },
    },
  ],
};
