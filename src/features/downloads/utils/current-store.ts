import { settings$ } from "@/state/settings";
import { downloadRoot } from "./download-root";
import { downloadStore } from "./download-store";

export const currentRoot = () => downloadRoot(settings$.device.peek());

export const currentStore = () => downloadStore(currentRoot());
