/** What a card shows and says about how far the user has read. */
export function toProgress(
  read: number | null | undefined,
  total: number | null | undefined,
) {
  const chapters = read ?? 0;

  if (!total) {
    return {
      label: `c.${chapters}`,
      spoken: `${chapters} chapters read`,
      fraction: undefined,
    };
  }

  return {
    label: `c.${chapters}/${total}`,
    spoken: `${chapters} of ${total} chapters read`,
    fraction: Math.min(chapters / total, 1),
  };
}
