import { useState } from "react";
import { pendingCount } from "@/features/activity/utils/state";
import { signOut } from "../utils/sign-out";
import { signOutDialog } from "../utils/sign-out-dialog";

/**
 * Signs out at once, or first asks when changes wait to be sent: signing out
 * drops them. `dialog` goes to the house `Dialog`.
 */
export function useSignOut() {
  const [open, setOpen] = useState(false);
  // Kept apart from `open` so the title holds while the dialog closes
  const [count, setCount] = useState(0);

  return {
    start: () => {
      const waiting = pendingCount();
      if (!waiting) return void signOut();
      setCount(waiting);
      setOpen(true);
    },
    dialog: {
      ...signOutDialog(count),
      open,
      onOpenChange: setOpen,
      onConfirm: () => void signOut(),
    },
  };
}
