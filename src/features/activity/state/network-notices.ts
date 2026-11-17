import { observe } from "@legendapp/state";
import { router } from "expo-router";
import { toast } from "@/components/ui/toast";
import { network$, takeAnnounced } from "@/state/network";
import { pendingCount } from "../screens/pending/utils/state";
import { debounceNotice } from "./utils/notice";

const change = debounceNotice(takeAnnounced, (text) =>
  toast(text, {
    action: { label: "View", onAction: () => router.push("/settings/pending") },
  }),
);

observe(() => change(network$.online.get(), pendingCount()));
