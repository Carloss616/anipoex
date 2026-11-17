import {
  addNetworkStateListener,
  getNetworkStateAsync,
  type NetworkState,
} from "expo-network";
import { AppState } from "react-native";
import { fetchOrNetworkError, isNetworkError } from "@/graphql/utils";
import { network$, networkAnswered, networkFailed, setSystem } from "./network";

const POLL_MS = 30_000;

/** Asks AniList for nothing: any HTTP answer proves the way is open. */
export async function ping() {
  const url = process.env.EXPO_PUBLIC_ANILIST_GRAPHQL_URL;
  if (!url) return;
  try {
    await fetchOrNetworkError(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"query":"{__typename}"}',
    });
    networkAnswered();
  } catch (error) {
    if (isNetworkError(error)) networkFailed();
  }
}

// Android's "no internet" means Google's check failed, which a blocked check
// or some VPNs and private DNS also cause: AniList's answer decides instead.
function apply({ isConnected, isInternetReachable }: NetworkState) {
  const connected = isConnected !== false;
  const wasConnected = network$.system.peek();
  setSystem(connected);
  if (connected && (!wasConnected || isInternetReachable === false)) ping();
}

function retry() {
  const { system, reachable } = network$.peek();
  if (AppState.currentState === "active" && system && !reachable) ping();
}

// The static web render has no `window`, and expo-network reports offline there.
if (typeof window !== "undefined") {
  getNetworkStateAsync().then(apply, () => {});
  addNetworkStateListener(apply);
  setInterval(retry, POLL_MS);
  AppState.addEventListener("change", (state) => {
    if (state === "active") retry();
  });
}
