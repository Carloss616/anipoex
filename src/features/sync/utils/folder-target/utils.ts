/** A file as a folder lists it, with what changes when it's rewritten. */
export interface ListedFile {
  name: string;
  /** Its modified time and size. */
  version: string;
}

/**
 * Keeps each file's text by its version, so a sync reads again only the
 * files another device rewrote: reading every device's files from a SAF or
 * iCloud folder took ~900 KB per device on each sync.
 *
 * shortcut: a rewrite that keeps both the modified time and the size is
 * missed until the file changes again; hash the text if that ever shows up.
 */
export function readCache() {
  const versions = new Map<string, string>();
  const texts = new Map<string, { version: string; text: string }>();
  return {
    /** Takes a fresh listing; resolves to its names. */
    list(files: ListedFile[]) {
      versions.clear();
      for (const { name, version } of files) versions.set(name, version);
      for (const name of texts.keys()) {
        if (!versions.has(name)) texts.delete(name);
      }
      return files.map((file) => file.name);
    },
    /** The file's text: kept while its version holds, else from `load`. */
    async read(name: string, load: () => Promise<string | undefined>) {
      const version = versions.get(name);
      const kept = texts.get(name);
      if (version !== undefined && kept?.version === version) return kept.text;
      const text = await load();
      if (text !== undefined && version !== undefined) {
        texts.set(name, { version, text });
      }
      return text;
    },
  };
}
