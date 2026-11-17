import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { CachePersistor } from "apollo3-cache-persist";
import { OperationTypeNode } from "graphql";
import { createMMKV } from "react-native-mmkv";
import { toast } from "@/components/ui/toast";
import { networkAnswered, networkFailed, onReconnect } from "@/state/network";
import { session$ } from "@/state/session";
import { fetchOrNetworkError, isNetworkError, shouldToast } from "./utils";

const GRAPHQL_URL = process.env.EXPO_PUBLIC_ANILIST_GRAPHQL_URL;

if (!GRAPHQL_URL) throw new Error("Missing AniList GraphQL URL");

const storage = createMMKV({ id: "apollo-cache" });

export const cache = new InMemoryCache({
  // Without it a fragment on a union member (`HomeActivity`) never matches.
  possibleTypes: {
    ActivityUnion: ["TextActivity", "ListActivity", "MessageActivity"],
  },
  typePolicies: {
    // A user's avatar has no id: merge the sizes each query asks for
    // (large for the viewer, medium in activity) instead of replacing them.
    UserAvatar: { merge: true },
    // Nor has a Page: a later query with other fields completes it.
    Page: { merge: true },
  },
});

// Reports before the error reaches the error link, which reads the state.
const reportingFetch = ((input, init) =>
  fetchOrNetworkError(input, init).then(
    (res) => {
      networkAnswered();
      return res;
    },
    (error: unknown) => {
      if (isNetworkError(error)) networkFailed();
      throw error;
    },
  )) as typeof fetch;

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
  const context = operation.getContext();

  if (
    !shouldToast(
      context,
      error,
      operation.operationType === OperationTypeNode.QUERY,
    )
  )
    return;

  const message = context.errorMessage;
  const { operationName, operationType, query, variables } = operation;

  toast.error(typeof message === "string" ? message : error.message, {
    // No Retry for mutations: re-sending here would skip the caller's `update`.
    ...(operationType === OperationTypeNode.QUERY && {
      action: {
        label: "Retry",
        onAction: () =>
          retryQuery({ operationName, query, variables, message }),
      },
    }),
  });
});

const answered = new Set<() => void>();

/** Calls `listener` after each answer from AniList without errors. */
export function onAnswered(listener: () => void) {
  answered.add(listener);
  return () => answered.delete(listener);
}

const answeredLink = new ApolloLink(
  (operation, forward) =>
    new Observable((observer) =>
      forward(operation).subscribe({
        next: (result) => {
          if (!result.errors) for (const listener of answered) listener();
          observer.next(result);
        },
        error: (error) => observer.error(error),
        complete: () => observer.complete(),
      }),
    ),
);

/**
 * Refetches a failed query's watchers, or re-runs it when nothing watches it
 * (a one-off `client.query`).
 */
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
    // A second failure toasts through this link; the rejection has no catcher.
    .catch(() => {});
}

export const client = new ApolloClient({
  // Error before retry, so a failure toasts once, not once per attempt.
  link: ApolloLink.from([
    authLink,
    errorLink,
    answeredLink,
    retryLink,
    new HttpLink({ uri: GRAPHQL_URL, fetch: reportingFetch }),
  ]),
  cache,
  devtools: { enabled: __DEV__, name: "anipoex" },
});

onReconnect(() => void client.refetchQueries({ include: "active" }));

// MMKV's localStorage shim throws in web's Node render, which persists nothing.
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

/** Started at import, so the read is in flight before the tree mounts. */
export const cacheRestored = persistor.restore().catch((error) => {
  // Never rejects: an unreadable snapshot costs a cold cache, not the boot.
  console.warn(
    "[apollo] failed to restore the persisted cache",
    error instanceof Error ? error.message : error,
  );
});

/** Drops the live cache and the disk copy: sign-out must forget everything. */
export async function clearCache() {
  await persistor.purge();
  await client.clearStore();
}
