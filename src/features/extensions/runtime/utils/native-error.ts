const CAUSE = "Caused by: ";
const EXCEPTION_CLASS = /^(?:[A-Za-z_$][\w$]*\.)+[A-Za-z_$][\w$]*: /;

/** The native cause's own message, without the bridge's "Call to function … rejected" wrapper or the exception class. */
export function nativeErrorMessage(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);
  const at = text.lastIndexOf(CAUSE);
  if (at === -1) return text;
  return text
    .slice(at + CAUSE.length)
    .trim()
    .replace(EXCEPTION_CLASS, "");
}
