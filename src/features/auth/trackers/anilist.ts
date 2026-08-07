import * as WebBrowser from "expo-web-browser";
import { type Tracker, UnauthorizedError, type User } from "../types/tracker";
import { parseFragment } from "../utils/parse-fragment";
import { CLIENT_ID, REDIRECT_URI } from "./anilist-config";

const AUTHORIZE_URL = "https://anilist.co/api/v2/oauth/authorize";
const GRAPHQL_URL = "https://graphql.anilist.co";

const VIEWER_QUERY = "query { Viewer { id name avatar { large } } }";

type ViewerResponse = {
  data?: { Viewer?: { id: number; name: string; avatar?: { large?: string } } };
};

/** The token is a one-year credential with no scopes */
export const anilist: Tracker = {
  id: "anilist",

  async authorize() {
    if (!CLIENT_ID) {
      throw new Error(
        "Missing AniList client ID — set EXPO_PUBLIC_ANILIST_CLIENT_ID_NATIVE and _WEB",
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

  async fetchViewer(token: string): Promise<User> {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query: VIEWER_QUERY }),
    });

    if (response.status === 401) throw new UnauthorizedError();
    if (!response.ok) {
      throw new Error(`AniList responded ${response.status}`);
    }

    const json = (await response.json()) as ViewerResponse;
    const viewer = json.data?.Viewer;
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
