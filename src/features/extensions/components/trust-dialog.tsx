import { Dialog } from "@/components/ui/dialog";
import type { Repo } from "@/features/extensions";

const KEY_PREVIEW_LENGTH = 8;

interface TrustDialogProps {
  /** The fetched repo awaiting trust; the dialog is open while it's set. */
  repo: Repo | undefined;
  onDismiss: () => void;
  onTrust: (repo: Repo) => void;
}

export function TrustDialog({ repo, onDismiss, onTrust }: TrustDialogProps) {
  return (
    <Dialog
      open={repo !== undefined}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
      title={`Trust ${repo?.name}?`}
      description={`Its extensions will run inside the app. Signing key ${repo?.signingKey.slice(0, KEY_PREVIEW_LENGTH)}…`}
      confirmLabel="Trust"
      onConfirm={() => repo && onTrust(repo)}
      alert
    />
  );
}
