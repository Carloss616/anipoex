import * as WebBrowser from "expo-web-browser";

/**
 * Landing page for the OAuth redirect on web.
 *
 * `openAuthSessionAsync` opens AniList in a popup; AniList redirects that popup
 * here with the token in the URL fragment. `maybeCompleteAuthSession` posts the
 * URL back to the window that opened it and lets it close, which is what
 * resolves the pending `authorize()` promise.
 *
 * Native never reaches this route: `+native-intent.tsx` rewrites
 * `anipoex://auth` to `/` before it becomes navigation, and the OS hands the
 * redirect straight to `openAuthSessionAsync`. The call is a no-op there.
 */
WebBrowser.maybeCompleteAuthSession();

// ponytail: renders nothing on purpose — the popup closes itself within a frame
// or two of mounting, so anything here would only ever flash.
export default function AuthCallbackScreen() {
  return null;
}
