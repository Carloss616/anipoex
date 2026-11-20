import { useEffect, useState } from "react";
import { Linking } from "react-native";

/**
 * The apps that install an IPA from `<scheme>://install?url=`, in the order
 * to offer them. iOS answers `canOpenURL` only for the schemes app.json lists
 * in `LSApplicationQueriesSchemes`.
 */
const STORES = [
  { name: "SideStore", scheme: "sidestore" },
  { name: "AltStore", scheme: "altstore" },
] as const;

export type Store = (typeof STORES)[number];

/** The first of the stores this device has, looked up each time the sheet opens. */
export function useStore(open: boolean) {
  const [store, setStore] = useState<Store>();
  useEffect(() => {
    if (!open) return;
    let current = true;
    void (async () => {
      for (const candidate of STORES) {
        const has = await Linking.canOpenURL(`${candidate.scheme}://`).catch(
          () => false,
        );
        if (has) {
          if (current) setStore(candidate);
          return;
        }
      }
      if (current) setStore(undefined);
    })();
    return () => {
      current = false;
    };
  }, [open]);
  return store;
}
