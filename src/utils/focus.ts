type Blurrable = { blur: () => Promise<void> };

const fields = new Set<Blurrable>();

/**
 * A native text field in a sheet can't tell it was tapped away from:
 * registering here lets `dismissFocus` reach it from anywhere in the tree.
 */
export function registerField(field: Blurrable) {
  fields.add(field);

  return () => {
    fields.delete(field);
  };
}

/** Blurring a blurred field is a no-op, so this needs no bookkeeping. */
export function dismissFocus() {
  for (const field of fields) void field.blur();
}
