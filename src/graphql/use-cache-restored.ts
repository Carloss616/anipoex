import { useEffect, useState } from "react";
import { cacheRestored } from "./client";

/**
 * Whether the persisted cache has landed. Gate the tree on it — mounting before
 * it does fires every query against an empty cache.
 *
 * The read itself starts at import, not here: this only subscribes to it.
 */
export function useCacheRestored() {
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    cacheRestored.then(() => setRestored(true));
  }, []);

  return restored;
}
