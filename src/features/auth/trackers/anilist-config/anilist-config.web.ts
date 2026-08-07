export const CLIENT_ID = process.env.EXPO_PUBLIC_ANILIST_CLIENT_ID_WEB;

// AniList matches its registered Redirect URL exactly, so the origin you run on
// must be the one registered for this client ID.
export const REDIRECT_URI =
  typeof window === "undefined" ? "" : `${window.location.origin}/auth`;
