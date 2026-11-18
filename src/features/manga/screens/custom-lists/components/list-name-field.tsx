import type { Observable } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { NewListField } from "@/features/manga/components/new-list-field";

/** Names a new list, or renames the one in `renaming$`. */
export function ListNameField({
  names,
  renaming$,
  onCreate,
  onRename,
}: {
  names: string[];
  renaming$: Observable<string | null>;
  onCreate: (name: string) => Promise<boolean>;
  onRename: (from: string, to: string) => Promise<boolean>;
}) {
  const renaming = useValue(renaming$);
  if (renaming == null)
    return <NewListField names={names} onSubmit={onCreate} />;
  return (
    <NewListField
      key={renaming}
      names={names.filter((name) => name !== renaming)}
      label={`Rename “${renaming}”`}
      initial={renaming}
      onCancel={() => renaming$.set(null)}
      onSubmit={async (to) => {
        const ok = await onRename(renaming, to);
        if (ok) renaming$.set(null);
        return ok;
      }}
    />
  );
}
