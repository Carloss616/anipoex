/** An entry's `customLists` map with `from` under the name `to`. */
export function renameList(value: unknown, from: string, to: string): unknown {
  if (!value || typeof value !== "object" || !Object.hasOwn(value, from)) {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value).map(([name, on]) => [name === from ? to : name, on]),
  );
}

/** The names an entry's `customLists` (Json `{ name: on }`) has on. */
export function enabledLists(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value).flatMap(([name, on]) =>
    on === true ? name : [],
  );
}
