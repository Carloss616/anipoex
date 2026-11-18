import { useState } from "react";
import { listNameError } from "@/features/manga/utils/custom-lists";

/** A list name being typed: why it can't be used yet, and using it. */
export function useNewList(
  names: string[],
  submit: (name: string) => Promise<boolean>,
  initial = "",
) {
  const [name, setName] = useState(initial);
  const [busy, setBusy] = useState(false);
  const error = listNameError(name, names);

  return {
    name,
    setName,
    busy,
    // An empty field isn't an error to show, only a reason to wait. Nor is one
    // being saved: the save files its name before it resolves.
    shownError: name.trim() && !busy ? error : null,
    canAdd: !busy && error == null,
    add: async () => {
      if (busy || error != null) return false;
      setBusy(true);
      const ok = await submit(name);
      setBusy(false);
      if (ok) setName("");
      return ok;
    },
  };
}
