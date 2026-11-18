/** Why a new list can't take `name`, or null when it can. */
export function listNameError(name: string, names: string[]) {
  const trimmed = name.trim();
  if (!trimmed) return "Enter a name";
  const lower = trimmed.toLowerCase();
  return names.some((n) => n.toLowerCase() === lower)
    ? "You already have this list"
    : null;
}

interface Group {
  name: string | null;
  isCustomList: boolean | null;
  entries: ({ id: number } | null)[] | null;
}

/**
 * What deleting `name` takes. AniList keeps an entry's lists by position, so
 * dropping a name slides every later list's manga down one, and the deleted
 * list's stay at its position, to show up in the next list made: those
 * entries are saved again, after the names, with their lists by name.
 */
export function removalPlan(
  names: string[],
  groups: (Group | null)[],
  name: string,
) {
  const at = names.indexOf(name);
  const next = names.filter((n) => n !== name);
  const moved = new Set(names.slice(at));
  const lists = new Map<number, string[]>();

  if (at >= 0) {
    for (const group of groups) {
      if (!group?.isCustomList || !moved.has(group.name ?? "")) continue;
      for (const entry of group.entries ?? []) {
        if (entry) lists.set(entry.id, []);
      }
    }
    for (const group of groups) {
      if (!group?.isCustomList || !group.name || group.name === name) continue;
      for (const entry of group.entries ?? []) {
        lists.get(entry?.id ?? -1)?.push(group.name);
      }
    }
  }

  return {
    next,
    resaves: [...lists].map(([id, customLists]) => ({ id, customLists })),
  };
}
