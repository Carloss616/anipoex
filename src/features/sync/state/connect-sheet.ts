import { observable } from "@legendapp/state";
import * as Clipboard from "expo-clipboard";
import { openExternal } from "@/utils/open-external";
import type { DeviceCode } from "../utils/device-flow";
import { canUseDeviceFlow, connectGitHub, startDeviceFlow } from "./connection";

/** The connect sheet: the code to type on GitHub, or the token field on web. */
export const connect$ = observable({
  open: false,
  code: undefined as DeviceCode | undefined,
  /** Waiting on GitHub: for a code, or for a pasted token to check out. */
  busy: false,
  error: undefined as string | undefined,
});

let abort: AbortController | undefined;

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * Opens the sheet. In the apps it asks GitHub for a code and connects by
 * itself once the user authorizes it; on the web it waits for a token.
 */
export async function openConnect() {
  abort?.abort();
  connect$.assign({ open: true, code: undefined, error: undefined });
  if (!canUseDeviceFlow) return;
  const current = new AbortController();
  abort = current;
  connect$.busy.set(true);
  try {
    const { code, connected } = await startDeviceFlow(current.signal);
    if (current.signal.aborted) return;
    connect$.code.set(code);
    await connected;
    connect$.open.set(false);
  } catch (error) {
    if (!current.signal.aborted) connect$.error.set(messageOf(error));
  } finally {
    if (abort === current) connect$.busy.set(false);
  }
}

/** Closes the sheet and stops waiting on GitHub. */
export function closeConnect() {
  abort?.abort();
  abort = undefined;
  connect$.assign({ open: false, busy: false });
}

/** Web: connects with a pasted token, keeping the sheet open on a failure. */
export async function connectWithToken(token: string) {
  connect$.assign({ busy: true, error: undefined });
  try {
    await connectGitHub(token.trim());
    connect$.open.set(false);
  } catch (error) {
    connect$.error.set(messageOf(error));
  } finally {
    connect$.busy.set(false);
  }
}

/** Copies the code and opens GitHub's page to type it. */
export function copyCodeAndOpenGitHub() {
  const code = connect$.code.peek();
  if (!code) return;
  void Clipboard.setStringAsync(code.userCode);
  openExternal(code.verificationUri);
}
