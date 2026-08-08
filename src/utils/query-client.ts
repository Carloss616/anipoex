import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { type Query, QueryClient } from "@tanstack/react-query";
import type { PersistQueryClientProviderProps } from "@tanstack/react-query-persist-client";
import Constants from "expo-constants";
import { createMMKV } from "react-native-mmkv";

const storage = createMMKV({ id: "query-cache" });

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "offlineFirst",
      staleTime: 5 * 60_000,
      // Infinity: only in-memory queries get saved; 5min GC would drop them.
      gcTime: Infinity,
      retry: 1,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => storage.getString(key),
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => {
      storage.remove(key);
    },
  },
  throttleTime: 2_000,
});

export const persistOptions: PersistQueryClientProviderProps["persistOptions"] =
  {
    persister,
    // Infinity: the 24h default wipes the whole cache after a day unopened.
    maxAge: Infinity,
    // Invalidates the cache when the app version changes
    buster: Constants.expoConfig?.version ?? "dev",
    dehydrateOptions: {
      // The default drops `error` queries, which still hold data after a 429.
      shouldDehydrateQuery: (query: Query) => query.state.data !== undefined,
    },
  };
