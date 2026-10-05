import { useCallback, useMemo, useState } from "react";
import { type Extension, type ExtensionsStore, LANGUAGE_LABEL } from "../data";

export interface ManagerVariantProps {
  store: ExtensionsStore;
}

export function useManagerLists(store: ExtensionsStore) {
  const [query, setQuery] = useState("");

  const filter = useCallback(
    (list: Extension[]) => {
      const q = query.trim().toLowerCase();
      if (!q) return list;
      return list.filter(
        (ext) =>
          ext.name.toLowerCase().includes(q) ||
          ext.author.toLowerCase().includes(q) ||
          LANGUAGE_LABEL[ext.language].toLowerCase().includes(q),
      );
    },
    [query],
  );

  const installed = useMemo(
    () => filter(store.installed),
    [store.installed, filter],
  );
  const available = useMemo(
    () => filter(store.available),
    [store.available, filter],
  );

  return { query, setQuery, installed, available };
}

export function extensionSubtitle(ext: Extension): string {
  const version =
    ext.version !== ext.latestVersion
      ? `v${ext.version} → ${ext.latestVersion}`
      : `v${ext.version}`;
  return `${version} · ${LANGUAGE_LABEL[ext.language]}`;
}
