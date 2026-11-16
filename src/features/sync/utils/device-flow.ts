import { SyncError } from "./github";

/** POSTs a form to github.com and returns its JSON; desktop goes through Electron. */
export type GitHubPost = (
  url: string,
  body: Record<string, string>,
) => Promise<Record<string, unknown>>;

const CODE_URL = "https://github.com/login/device/code";
const TOKEN_URL = "https://github.com/login/oauth/access_token";

export interface DeviceCode {
  userCode: string;
  verificationUri: string;
  deviceCode: string;
  /** Seconds between polls. */
  interval: number;
  expiresAt: number;
}

/** Asks GitHub for the code the user types at `verificationUri`. */
export async function requestDeviceCode(
  clientId: string,
  post: GitHubPost,
  now = Date.now,
): Promise<DeviceCode> {
  const res = await post(CODE_URL, { client_id: clientId, scope: "gist" });
  if (
    typeof res.device_code !== "string" ||
    typeof res.user_code !== "string"
  ) {
    throw new SyncError(
      "other",
      String(res.error_description ?? res.error ?? "GitHub gave no code"),
    );
  }
  return {
    userCode: res.user_code,
    verificationUri: String(
      res.verification_uri ?? "https://github.com/login/device",
    ),
    deviceCode: res.device_code,
    interval: Number(res.interval) || 5,
    expiresAt: now() + (Number(res.expires_in) || 900) * 1000,
  };
}

/**
 * Polls until the user authorizes the code, then resolves to the token.
 * Rejects when they deny it, it expires, or `signal` aborts.
 */
export async function pollForToken(
  clientId: string,
  code: DeviceCode,
  post: GitHubPost,
  {
    signal,
    sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
    now = Date.now,
  }: {
    signal?: AbortSignal;
    sleep?: (ms: number) => Promise<unknown>;
    now?: () => number;
  } = {},
): Promise<string> {
  let interval = code.interval;
  while (now() < code.expiresAt) {
    await sleep(interval * 1000);
    if (signal?.aborted) throw new SyncError("other", "Cancelled");
    // A dropped request is a missed poll, not a failed sign-in.
    const res = await post(TOKEN_URL, {
      client_id: clientId,
      device_code: code.deviceCode,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    }).catch((): Record<string, unknown> => ({ error: "offline" }));
    if (typeof res.access_token === "string") return res.access_token;
    // GitHub asks for a slower pace by adding 5 s to the interval.
    if (res.error === "slow_down") interval += 5;
    else if (res.error !== "authorization_pending" && res.error !== "offline") {
      throw new SyncError(
        "other",
        res.error === "access_denied"
          ? "Access was denied on GitHub"
          : String(
              res.error_description ?? res.error ?? "GitHub refused the code",
            ),
      );
    }
  }
  throw new SyncError("other", "The code expired");
}
