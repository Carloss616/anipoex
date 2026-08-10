export const CLIENT_ID = process.env.EXPO_PUBLIC_ANILIST_CLIENT_ID_WEB;

// AniList matches exactly, so run on the origin registered for this client ID.
export const REDIRECT_URI =
  typeof window === "undefined" ? "" : `${window.location.origin}/auth`;
