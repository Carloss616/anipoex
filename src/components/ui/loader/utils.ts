/** The spinner's track: the arc's hex color at 20% alpha, short forms expanded. */
export function trackColorOf(color: string | undefined) {
  const hex = color?.match(/^#([0-9a-f]{6}|[0-9a-f]{3})/i)?.[1];
  if (!hex) return undefined;
  const full = hex.length === 3 ? hex.replace(/./g, "$&$&") : hex;
  return `#${full}33`;
}
