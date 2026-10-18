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
import { OperationTypeNode } from "graphql";
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

  const { operationName, operationType, query, variables } = operation;

  toast.destructive(typeof message === "string" ? message : error.message, {
    // No Retry for mutations: re-sending from here would skip the caller's `update`.
    ...(operationType === OperationTypeNode.QUERY && {
      actionLabel: "Retry",
      onAction: () => retryQuery({ operationName, query, variables, message }),
    }),
  });
});

/** Refetches the watchers of a failed query, or re-runs it when nothing watches it (a one-off `client.query`). */
function retryQuery({
  operationName,
  query,
  variables,
  message,
}: Pick<ApolloLink.Operation, "operationName" | "query" | "variables"> & {
  message: unknown;
}) {
  const watched = [...client.getObservableQueries("active")].some(
    (observable) => observable.queryName === operationName,
  );

  if (watched && operationName) {
    client.refetchQueries({ include: [operationName] });
    return;
  }

  client
    .query({
      query,
      variables,
      fetchPolicy: "network-only",
      context: { errorMessage: message },
    })
    // A second failure toasts again through this link; the rejection has no one to catch it.
    .catch(() => {});
}

export const client = new ApolloClient({
  // Error sits upstream of retry, so a failure toasts once, not once per attempt.
  link: ApolloLink.from([
    authLink,
    errorLink,
    retryLink,
    new HttpLink({ uri: GRAPHQL_URL }),
  ]),
  cache,
  devtools: { enabled: __DEV__, name: "anipoex" },
});

// MMKV's localStorage shim throws in web's Node render, where nothing persists anyway.
const hasStorage = typeof window !== "undefined";

const persistor = new CachePersistor({
  cache,
  key: "snapshot",
  storage: {
    getItem: (key) => (hasStorage ? (storage.getString(key) ?? null) : null),
    setItem: (key, value) => {
      if (hasStorage) storage.set(key, String(value));
    },
    removeItem: (key) => {
      if (hasStorage) storage.remove(key);
    },
  },
  // The default 1MB ceiling silently stops persisting once a few lists are in.
  maxSize: false,
  debounce: 2_000,
});

/** Started at import so the read is already in flight by the time the tree mounts. */
export const cacheRestored = persistor.restore().catch((error) => {
  // Never rejects: an unreadable snapshot costs a cold cache, not the boot.
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
