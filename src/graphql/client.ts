import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { CachePersistor } from "apollo3-cache-persist";
import { createMMKV } from "react-native-mmkv";
import { toast } from "@/components/ui/toast";
import { session$ } from "@/state/session";

const GRAPHQL_URL = process.env.EXPO_PUBLIC_ANILIST_GRAPHQL_URL;

if (!GRAPHQL_URL) throw new Error("Missing AniList GraphQL URL");

const storage = createMMKV({ id: "apollo-cache" });

export const cache = new InMemoryCache();

const authLink = new SetContextLink((prevContext) => {
  const token = session$.token.peek();

  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: "application/graphql-response+json",
    },
  };
});

// One extra attempt, then surface it.
const retryLink = new RetryLink({ attempts: { max: 2 } });

const errorLink = new ErrorLink(({ error, operation }) => {
  const { errorMessage: message, silent } = operation.getContext();

  if (silent) return;

  const { operationName } = operation;

  toast.danger(typeof message === "string" ? message : error.message, {
    ...(operationName && {
      actionLabel: "Retry",
      onAction: () => {
        client.refetchQueries({ include: [operationName] });
      },
    }),
  });
});

export const client = new ApolloClient({
  // Order matters: the error link sits upstream of retry, so a failure toasts
  // once after the attempts are spent instead of once per attempt.
  link: ApolloLink.from([
    authLink,
    errorLink,
    retryLink,
    new HttpLink({ uri: GRAPHQL_URL }),
  ]),
  cache,
  devtools: { enabled: __DEV__, name: "anipoex" },
});

const persistor = new CachePersistor({
  cache,
  key: "snapshot",
  storage: {
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => {
      storage.remove(key);
    },
  },
  // The default 1MB ceiling silently stops persisting once a few lists are in.
  maxSize: false,
  debounce: 2_000,
});

/** Started at import so the read is already in flight by the time the tree mounts. */
export const cacheRestored = persistor.restore().catch((error) => {
  // A corrupt or unreadable snapshot must not keep the app from booting — the
  // worst case is a cold cache. Never rejects, so callers just await it.
  console.warn(
    "[apollo] failed to restore the persisted cache",
    error instanceof Error ? error.message : error,
  );
});

/** Drops both the live cache and what's on disk — sign-out has to forget everything. */
export async function clearCache() {
  await persistor.purge();
  await client.clearStore();
}
