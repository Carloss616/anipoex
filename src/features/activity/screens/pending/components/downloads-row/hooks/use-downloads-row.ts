import { useValue } from "@legendapp/state/react";
import { downloadQueue$ } from "@/features/downloads";
import { network$ } from "@/state/network";

/** The chapters left to download, and whether they wait for a connection. */
export function useDownloadsRow() {
  const count = useValue(
    () =>
      Object.values(downloadQueue$.get()).filter((d) => d.state !== "failed")
        .length,
  );
  const offline = useValue(() => !network$.online.get());

  return { label: `${count} chapter${count === 1 ? "" : "s"}`, offline };
}
