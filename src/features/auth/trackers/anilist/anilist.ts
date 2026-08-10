import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { fetcher } from "@/graphql/fetcher";
import type { Tracker, User } from "../../types/tracker";
import { parseFragment } from "../../utils/parse-fragment";
import { CLIENT_ID, REDIRECT_URI } from "./constants";
import { ViewerDocument } from "./graphql/viewer.generated";

const AUTHORIZE_URL = process.env.EXPO_PUBLIC_ANILIST_AUTHORIZE_URL;

/** The token is a one-year credential with no scopes */
export const anilist: Tracker = {
  id: "anilist",

  async authorize() {
    if (!AUTHORIZE_URL) {
      throw new Error(
        "Missing AniList authorize URL — set EXPO_PUBLIC_ANILIST_AUTHORIZE_URL",
      );
    }

    if (!CLIENT_ID) {
      throw new Error(
        `Missing AniList client ID — set EXPO_PUBLIC_ANILIST_CLIENT_ID_${Platform.select({ web: "WEB", default: "NATIVE" })}`,
      );
    }

    // Implicit grant takes only these two params. The redirect URI comes from
    // the AniList app registration, not from the query string.
    const url = `${AUTHORIZE_URL}?client_id=${encodeURIComponent(CLIENT_ID)}&response_type=token`;
    const result = await WebBrowser.openAuthSessionAsync(url, REDIRECT_URI);

    if (result.type !== "success") return null;

    const accessToken = parseFragment(result.url).access_token;
    if (!accessToken) {
      throw new Error("AniList did not return an access_token");
    }
    return { accessToken };
  },

  async fetchViewer(): Promise<User> {
    const { Viewer: viewer } = await fetcher(ViewerDocument)();
    if (!viewer) {
      throw new Error("AniList did not return Viewer");
    }

    return {
      id: viewer.id,
      name: viewer.name,
      avatarUrl: viewer.avatar?.large ?? null,
    };
  },
};
