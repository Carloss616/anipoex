import { observe } from "@legendapp/state";
import { toast } from "@/components/ui/toast";
import { pendingProgress$ } from "@/features/manga/state/pending-progress";
import { network$, takeAnnounced } from "@/state/network";
import { debounceNotice, noticeText } from "./utils/notice";

const change = debounceNotice(
  (online) =>
    noticeText(
      online,
      takeAnnounced(),
      Object.keys(pendingProgress$.peek()).length,
    ),
  (text) => toast(text),
);

observe(() => change(network$.online.get()));
