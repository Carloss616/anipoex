import Constants from "expo-constants";

// Two client IDs because AniList allows one Redirect URL per registered app.
export const CLIENT_ID = process.env.EXPO_PUBLIC_ANILIST_CLIENT_ID_NATIVE;

const scheme = [Constants.expoConfig?.scheme].flat()[0];
export const REDIRECT_URI = `${scheme}://auth`;
