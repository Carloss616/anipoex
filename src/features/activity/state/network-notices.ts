import { observe } from "@legendapp/state";
import { toast } from "@/components/ui/toast";
import { pendingEntries$ } from "@/features/manga/state/pending-entries";
import { network$, takeAnnounced } from "@/state/network";
import { debounceNotice } from "./utils/notice";

const change = debounceNotice(takeAnnounced, (text) => toast(text));

observe(() =>
  change(network$.online.get(), Object.keys(pendingEntries$.peek()).length),
);
