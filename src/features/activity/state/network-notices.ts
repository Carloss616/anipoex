import { observe } from "@legendapp/state";
import { router } from "expo-router";
import { toast } from "@/components/ui/toast";
import { pendingEntries$ } from "@/features/manga/state/pending-entries";
import { network$, takeAnnounced } from "@/state/network";
import { debounceNotice } from "./utils/notice";

const change = debounceNotice(takeAnnounced, (text) =>
  toast(text, {
    action: {
      label: "View",
      onAction: () => router.push("/settings/activity?filter=send"),
    },
  }),
);

// Only the connection schedules a notice: each sent change would reset it.
observe(() =>
  change(network$.online.get(), Object.keys(pendingEntries$.peek()).length),
);
