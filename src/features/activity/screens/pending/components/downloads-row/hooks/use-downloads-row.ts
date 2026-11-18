import { useValue } from "@legendapp/state/react";
import { downloadQueue$ } from "@/features/downloads";

/** The chapters waiting for a connection to download. */
export function useDownloadsRow() {
  const count = useValue(
    () =>
      Object.values(downloadQueue$.get()).filter(
        (d) => d.state === "queued" || d.state === "running",
      ).length,
  );

  return { label: `${count} chapter${count === 1 ? "" : "s"}` };
}
