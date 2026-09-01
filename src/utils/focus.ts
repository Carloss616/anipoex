type Blurrable = { blur: () => Promise<void> };

const fields = new Set<Blurrable>();

/**
 * A native text field inside a sheet has no way to know it was tapped away
 * from. Registering here lets `dismissFocus` reach it from anywhere in the tree.
 */
export function registerField(field: Blurrable) {
  fields.add(field);

  return () => {
    fields.delete(field);
  };
}

/** Blurring an already-blurred field is a no-op, so this needs no bookkeeping. */
export function dismissFocus() {
  for (const field of fields) void field.blur();
}
