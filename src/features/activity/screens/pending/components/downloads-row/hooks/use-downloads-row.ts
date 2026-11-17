import { useValue } from "@legendapp/state/react";
import { downloadQueue$ } from "@/features/downloads";
import { network$ } from "@/state/network";

/** How many chapters the queue holds, and whether they wait for a connection. */
export function useDownloadsRow() {
  const count = useValue(() => Object.keys(downloadQueue$.get(true)).length);
  const offline = useValue(() => !network$.online.get());

  return { label: `${count} chapter${count === 1 ? "" : "s"}`, offline };
}
