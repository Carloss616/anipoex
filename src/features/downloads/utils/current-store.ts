import { settings$ } from "@/state/settings";
import { downloadRoot } from "./download-root";
import { downloadStore } from "./download-store";

export const currentStore = () =>
  downloadStore(downloadRoot(settings$.device.peek()));
