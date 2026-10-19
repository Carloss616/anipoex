import { beforeAll, describe, expect, it, mock } from "bun:test";

const signIn = mock<(url: string) => Promise<string | null>>();
let anilist: typeof import("./anilist").anilist;

mock.module("@/utils/desktop", () => ({ desktop: { signIn } }));
mock.module("expo-web-browser", () => ({ openAuthSessionAsync: mock() }));
mock.module("expo-constants", () => ({ default: { expoConfig: {} } }));
mock.module("react-native", () => ({ Platform: { select: () => "" } }));
mock.module("@/graphql/client", () => ({ client: {} }));

// `anilist` reads these at import, so they are set before loading it.
beforeAll(async () => {
  process.env.EXPO_PUBLIC_ANILIST_AUTHORIZE_URL =
    "https://example.com/oauth/authorize";
  process.env.EXPO_PUBLIC_ANILIST_CLIENT_ID_NATIVE = "1";
  ({ anilist } = await import("./anilist"));
});

describe("anilist.authorize on desktop", () => {
  it("token", async () => {
    signIn.mockResolvedValueOnce("http://localhost:8081/auth#access_token=tok");
    expect(await anilist.authorize()).toEqual({ accessToken: "tok" });
    expect(signIn).toHaveBeenLastCalledWith(
      "https://example.com/oauth/authorize?client_id=1&response_type=token",
    );
  });

  it("closed", async () => {
    signIn.mockResolvedValueOnce(null);
    expect(await anilist.authorize()).toBeNull();
  });

  it("denied", async () => {
    signIn.mockResolvedValueOnce(
      "http://localhost:8081/auth?error=access_denied",
    );
    expect(await anilist.authorize()).toBeNull();
  });
});
