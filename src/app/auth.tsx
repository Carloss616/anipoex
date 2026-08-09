import * as WebBrowser from "expo-web-browser";

// OAuth landing for web: posts the token-bearing URL back to the opener and
// closes the popup, resolving the pending `authorize()`. No-op on native,
// where `+native-intent.tsx` rewrites `scheme://auth` before it navigates.
WebBrowser.maybeCompleteAuthSession();

// Renders nothing: the popup closes within a frame or two of mounting.
export default function AuthCallbackScreen() {
  return null;
}
