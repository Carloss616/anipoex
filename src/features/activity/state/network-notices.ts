import { observe } from "@legendapp/state";
import { toast } from "@/components/ui/toast";
import { network$, takeAnnounced } from "@/state/network";
import { pendingCount } from "../screens/pending/utils/state";
import { debounceNotice } from "./utils/notice";

const change = debounceNotice(takeAnnounced, (text) => toast(text));

observe(() => change(network$.online.get(), pendingCount()));
