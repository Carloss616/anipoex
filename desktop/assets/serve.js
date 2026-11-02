import { statSync } from "node:fs";
import path from "node:path";

const isFile = (file) => {
  try {
    return statSync(file, { throwIfNoEntry: false })?.isFile() ?? false;
  } catch {
    return false;
  }
};

/** Maps a URL path to a file of the static web export (the exact file, `<path>.html`, `<path>/index.html`, else `index.html` for a client route); `null` when the decoded path leaves `root`. */
export function resolveAsset(root, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const base = path.resolve(root);
  const relative = path.relative(base, path.join(base, decoded));
  if (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  )
    return null;
  const file = path.join(base, relative);
  const candidates = relative
    ? [file, `${file}.html`, path.join(file, "index.html")]
    : [];
  return [...candidates, path.join(base, "index.html")].find(isFile) ?? null;
}
