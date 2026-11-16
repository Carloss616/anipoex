import { useObserve } from "@legendapp/state/react";
import { useState } from "react";
import { toast } from "@/components/ui/toast";
import {
  type DownloadRoot,
  downloaded$,
  downloadRoot,
  downloadStore,
  moveDownloads,
  refreshDownloaded,
  sameRoot,
} from "@/features/downloads";
import { settings$ } from "@/state/settings";
import { folderName } from "@/utils/picked-folder";

interface Offer {
  from: DownloadRoot;
  to: DownloadRoot;
  count: number;
}

// The house toast can't update in place: a new one when the last has gone.
const PROGRESS_EVERY_MS = 4000;

const currentRoot = () => downloadRoot(settings$.device.peek());

function refreshAll() {
  for (const key of Object.keys(downloaded$.peek())) {
    const at = key.indexOf("/");
    // A failed listing keeps what was shown.
    void refreshDownloaded(Number(key.slice(0, at)), key.slice(at + 1)).catch(
      () => {},
    );
  }
}

async function move({ from, to }: Offer) {
  const source = downloadStore(from);
  const target = downloadStore(to);
  if (!source || !target) return;
  let shownAt = 0;
  try {
    const { moved, failed } = await moveDownloads(
      source,
      target,
      (done, total) => {
        if (done === total || Date.now() - shownAt < PROGRESS_EVERY_MS) return;
        shownAt = Date.now();
        toast(`Moving downloads… ${done}/${total}`);
      },
    );
    toast.success(
      `Moved ${moved} chapters${failed ? `, ${failed} failed` : ""}`,
    );
  } catch (error) {
    toast.error(
      `Couldn't move downloads: ${error instanceof Error ? error.message : error}`,
    );
  }
  refreshAll();
}

/** Offers to move the downloads when the folder they go to changes. */
export function useMoveDownloads() {
  const [offer, setOffer] = useState<Offer>();

  useObserve(
    () => downloadRoot(settings$.device.get()),
    ({ value: to, previous: from }) => {
      if (!from || !to || sameRoot(from, to)) return;
      setOffer(undefined);
      downloadStore(from)
        ?.listAll()
        .then(
          (paths) => {
            // A later change made this offer stale.
            if (paths.length && sameRoot(to, currentRoot()))
              setOffer({ from, to, count: paths.length });
          },
          () => {},
        );
    },
  );

  const name =
    offer?.to.kind === "folder"
      ? folderName(offer.to.location) || "the folder"
      : "this device";

  return {
    open: !!offer,
    title: offer ? `Move ${offer.count} downloaded chapters to ${name}?` : "",
    move: () => offer && void move(offer),
    dismiss: () => setOffer(undefined),
  };
}
