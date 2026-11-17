import { observe } from "@legendapp/state";
import { network$ } from "@/state/network";
import { activeScans$ } from "./active-scans";
import { libraryScan$, stopReadingScan } from "./library-scan";
import { stopScanAll } from "./probes";

// A scan can't tell a dropped connection from a failing source: stop them.
observe(() => {
  if (network$.online.get()) return;
  if (libraryScan$.peek()) stopReadingScan();
  for (const key of Object.keys(activeScans$.peek())) stopScanAll(key);
});
