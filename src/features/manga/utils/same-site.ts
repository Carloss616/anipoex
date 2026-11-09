const bare = (host: string) => host.toLowerCase().replace(/^www\./, "");

/** Whether `host` and `url`'s host are equal, or one is under the other. */
export function sameSite(host: string, url: string): boolean {
  let other: string;
  try {
    other = bare(new URL(url).hostname);
  } catch {
    return false;
  }
  const one = bare(host);
  return (
    one === other || one.endsWith(`.${other}`) || other.endsWith(`.${one}`)
  );
}
