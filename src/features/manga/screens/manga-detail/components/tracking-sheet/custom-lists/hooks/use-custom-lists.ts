import { useState } from "react";
import { useManageCustomLists } from "@/features/manga/hooks/use-manage-custom-lists";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";

/** The lists picked for the manga; a list made here starts picked. */
export function useCustomLists(form: TrackingForm) {
  const { lists, create } = useManageCustomLists();
  const names = lists?.map((list) => list.name) ?? [];
  const [selected, setSelected] = useState(form.customLists);

  // The account's order, whatever order they were picked in.
  const customLists = names.filter((name) => selected.includes(name));
  const dirty =
    customLists.length !== form.customLists.length ||
    customLists.some((name) => !form.customLists.includes(name));

  return {
    names,
    selected,
    toggle: (name: string) =>
      setSelected((current) =>
        current.includes(name)
          ? current.filter((n) => n !== name)
          : [...current, name],
      ),
    next: { ...form, customLists },
    dirty,
    create: async (name: string) => {
      const ok = await create(name);
      if (ok) setSelected((current) => [...current, name.trim()]);
      return ok;
    },
  };
}
